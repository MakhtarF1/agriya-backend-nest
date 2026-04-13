import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { conversationInclude, productInclude } from '../../shared/constants/includes';
import { ChatIaDto, RecetteVersPanierDto, TtsDto } from './dto/ai.dto';

@Injectable()
export class AiService {
  private readonly openai?: OpenAI;
  private readonly chatModel: string;
  private readonly visionModel: string;

  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('openai.apiKey');
    this.chatModel = this.config.get<string>('openai.chatModel') || 'gpt-4.1-mini';
    this.visionModel = this.config.get<string>('openai.visionModel') || 'gpt-4.1-mini';
    if (apiKey) this.openai = new OpenAI({ apiKey });
  }

  async chat(userId: string, dto: ChatIaDto) {
    const conversation = dto.conversationId
      ? await this.prisma.aiConversation.findUnique({ where: { id: dto.conversationId }, include: conversationInclude })
      : await this.prisma.aiConversation.create({
          data: {
            userId,
            channel: 'TEXTE',
            subject: dto.message.slice(0, 80),
            language: dto.langue || 'fr',
            country: dto.pays || 'SN',
          },
          include: conversationInclude,
        });

    await this.prisma.aiMessage.create({
      data: {
        conversationId: conversation!.id,
        senderType: 'UTILISATEUR',
        messageType: 'TEXTE',
        textContent: dto.message,
      },
    });

    const assistantText = await this.generateAssistantReply(dto.message, dto.langue || 'fr', dto.pays || 'SN');

    await this.prisma.aiMessage.create({
      data: {
        conversationId: conversation!.id,
        senderType: 'ASSISTANT',
        messageType: 'TEXTE',
        textContent: assistantText.resume,
        structuredJson: assistantText,
      },
    });

    return this.prisma.aiConversation.findUniqueOrThrow({ where: { id: conversation!.id }, include: conversationInclude });
  }

  async chatAvecMedia(userId: string, message: string, mediaId: string, kind: 'IMAGE' | 'AUDIO' | 'VIDEO') {
    const conversation = await this.prisma.aiConversation.create({
      data: {
        userId,
        channel: kind === 'IMAGE' ? 'IMAGE' : kind === 'AUDIO' ? 'AUDIO' : 'VIDEO',
        subject: message.slice(0, 80),
      },
      include: conversationInclude,
    });

    await this.prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: 'UTILISATEUR',
        messageType: kind === 'IMAGE' ? 'IMAGE' : kind === 'AUDIO' ? 'AUDIO' : 'VIDEO',
        textContent: message,
        mediaId,
      },
    });

    const assistantText = await this.generateAssistantReply(
      `${message}\nSupport joint: ${kind}. Demander une photo nette, ou proposer un diagnostic prudent si possible.`,
      'fr',
      'SN',
    );

    await this.prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: 'ASSISTANT',
        messageType: 'TEXTE',
        textContent: assistantText.resume,
        structuredJson: assistantText,
      },
    });

    return this.prisma.aiConversation.findUniqueOrThrow({ where: { id: conversation.id }, include: conversationInclude });
  }

  async tts(dto: TtsDto) {
    return {
      texte: dto.texte,
      audioUrl: null,
      lectureNavigateurConseillee: true,
      mimeType: 'text/plain',
    };
  }

  async transcrire(message: string | undefined, mediaId: string) {
    const media = await this.prisma.mediaFile.findUniqueOrThrow({ where: { id: mediaId } });
    return {
      media,
      transcription: message || 'Transcription simulée disponible. Ajoute OpenAI pour une transcription temps réel.',
    };
  }

  conversations(userId: string) {
    return this.prisma.aiConversation.findMany({ where: { userId }, include: conversationInclude, orderBy: { updatedAt: 'desc' } });
  }

  conversation(id: string, userId: string) {
    return this.prisma.aiConversation.findFirstOrThrow({ where: { id, userId }, include: conversationInclude });
  }

  async ajouterMessage(userId: string, conversationId: string, message: string, mediaId?: string, typeMessage: string = 'TEXTE') {
    await this.prisma.aiConversation.findFirstOrThrow({ where: { id: conversationId, userId } });
    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        senderType: 'UTILISATEUR',
        messageType: typeMessage as any,
        textContent: message,
        mediaId,
      },
    });
    const assistantText = await this.generateAssistantReply(message, 'fr', 'SN');
    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        senderType: 'ASSISTANT',
        messageType: 'TEXTE',
        textContent: assistantText.resume,
        structuredJson: assistantText,
      },
    });
    return this.prisma.aiConversation.findUniqueOrThrow({ where: { id: conversationId }, include: conversationInclude });
  }

  async recetteVersPanier(dto: RecetteVersPanierDto) {
    const products = await this.prisma.product.findMany({ where: { status: 'PUBLIE' }, include: productInclude, take: 20 });
    const ingredients = this.extractIngredients(dto.besoin, dto.ingredientsConnus || []);
    const suggestions = ingredients.map((ingredient) => {
      const normalized = ingredient.toLowerCase();
      const matching = products.find((product) => product.name.toLowerCase().includes(normalized) || product.category?.toLowerCase().includes(normalized));
      return {
        ingredient,
        produit: matching || null,
        quantiteSuggeree: normalized.includes('riz') ? '2 kg' : '1 kg',
      };
    });
    return {
      besoin: dto.besoin,
      ingredients,
      suggestions,
      totalSuggestions: suggestions.filter((item) => item.produit).length,
    };
  }

  private extractIngredients(besoin: string, known: string[]) {
    const text = besoin.toLowerCase();
    const keywords = ['riz', 'tomate', 'oignon', 'poisson', 'huile', 'pomme de terre', 'piment', 'carotte', 'citron'];
    const found = keywords.filter((item) => text.includes(item));
    const ingredients = Array.from(new Set([...known, ...found]));
    return ingredients.length ? ingredients : ['riz', 'tomate', 'oignon'];
  }

  private async generateAssistantReply(message: string, langue: string, pays: string) {
    if (!this.openai) {
      return {
        domaine: 'agriculture',
        langue,
        pays,
        resume: `Analyse AGRIYA: ${message}. Envoie une photo nette ou décris mieux le problème pour une recommandation plus précise.`,
        urgence: 'MOYEN',
        scoreConfiance: 0.62,
        actions: ['Observer les feuilles touchées', 'Vérifier l’humidité du sol', 'Partager une photo ou vidéo nette'],
        risques: ['Diagnostic incomplet sans visuel', 'Risque de retard de traitement'],
      };
    }

    const prompt = `
Tu es AGRIYA, un assistant agricole professionnel pour le Sénégal et l'Afrique de l'Ouest.

Règles :
- Réponds uniquement en ${langue}.
- Le pays courant est ${pays}.
- Si la demande est hors agriculture, refuse poliment.
- Retourne un JSON strict avec ces clés :
{
  "domaine": "agriculture",
  "langue": "${langue}",
  "pays": "${pays}",
  "resume": "string",
  "urgence": "FAIBLE|MOYEN|ELEVE",
  "scoreConfiance": number,
  "actions": ["string"],
  "risques": ["string"]
}

Message utilisateur :
${message}
`;

    const completion = await this.openai.chat.completions.create({
      model: this.chatModel,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            "Tu es AGRIYA. Tu réponds uniquement sur l’agriculture, les cultures, les maladies des plantes, les sols, l’irrigation, la récolte, la vente agricole et l’approvisionnement agricole.",
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const text = completion.choices?.[0]?.message?.content || '';

    try {
      const parsed = JSON.parse(text);
      return {
        domaine: parsed.domaine || 'agriculture',
        langue: parsed.langue || langue,
        pays: parsed.pays || pays,
        resume: parsed.resume || 'Réponse AGRIYA générée.',
        urgence: parsed.urgence || 'MOYEN',
        scoreConfiance: typeof parsed.scoreConfiance === 'number' ? parsed.scoreConfiance : 0.7,
        actions: Array.isArray(parsed.actions) ? parsed.actions : ['Analyser le terrain', 'Partager une photo nette'],
        risques: Array.isArray(parsed.risques) ? parsed.risques : ['Diagnostic à confirmer'],
      };
    } catch {
      return {
        domaine: 'agriculture',
        langue,
        pays,
        resume: text || 'Réponse AGRIYA générée.',
        urgence: 'MOYEN',
        scoreConfiance: 0.7,
        actions: ['Analyser le terrain', 'Partager une photo nette'],
        risques: ['Diagnostic à confirmer'],
      };
    }
  }
}
