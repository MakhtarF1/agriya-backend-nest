import { Prisma } from '@prisma/client';

const conversationMessagesArgs = Prisma.validator<Prisma.AiConversation$messagesArgs>()({
  include: { media: true },
  orderBy: { createdAt: 'asc' },
});

const productImagesArgs = Prisma.validator<Prisma.Product$imagesArgs>()({
  include: { media: true },
  orderBy: { sortOrder: 'asc' },
});

export const userInclude = Prisma.validator<Prisma.UserInclude>()({
  profile: true,
  organizations: { include: { organization: true } },
  subscriptions: { include: { plan: true } },
});

export const organizationInclude = Prisma.validator<Prisma.OrganizationInclude>()({
  owner: { include: { profile: true } },
  members: { include: { user: { include: { profile: true } } } },
  subscriptions: { include: { plan: true } },
});

export const farmInclude = Prisma.validator<Prisma.FarmInclude>()({
  owner: { include: { profile: true } },
  plots: { include: { crops: true } },
});

export const plotInclude = Prisma.validator<Prisma.PlotInclude>()({
  farm: { include: { owner: { include: { profile: true } } } },
  crops: true,
});

export const cropInclude = Prisma.validator<Prisma.CropInclude>()({
  plot: { include: { farm: true } },
});

export const diagnosisInclude = Prisma.validator<Prisma.DiagnosisInclude>()({
  user: { include: { profile: true } },
  plot: { include: { farm: true } },
  crop: true,
  conversation: { include: { messages: conversationMessagesArgs } },
  mediaLinks: { include: { media: true } },
});

export const conversationInclude = Prisma.validator<Prisma.AiConversationInclude>()({
  user: { include: { profile: true } },
  messages: conversationMessagesArgs,
});

export const productInclude = Prisma.validator<Prisma.ProductInclude>()({
  seller: { include: { profile: true } },
  farm: true,
  images: productImagesArgs,
});

const orderItemsArgs = Prisma.validator<Prisma.Order$itemsArgs>()({
  include: {
    product: {
      include: productInclude,
    },
  },
});

export const purchaseRequestInclude = Prisma.validator<Prisma.PurchaseRequestInclude>()({
  buyer: { include: { profile: true } },
  organization: true,
});

export const cartItemInclude = Prisma.validator<Prisma.CartItemInclude>()({
  product: {
    include: productInclude,
  },
});

export const orderInclude = Prisma.validator<Prisma.OrderInclude>()({
  buyer: { include: { profile: true } },
  seller: { include: { profile: true } },
  organization: true,
  items: orderItemsArgs,
});

export const subscriptionInclude = Prisma.validator<Prisma.SubscriptionInclude>()({
  plan: true,
  user: { include: { profile: true } },
  organization: true,
  payments: true,
});

export const paymentInclude = Prisma.validator<Prisma.PaymentInclude>()({
  user: { include: { profile: true } },
  subscription: { include: { plan: true, organization: true } },
});

export const taskInclude = Prisma.validator<Prisma.TaskInclude>()({
  plot: { include: { farm: true } },
  crop: true,
  reminders: true,
});

export const reminderInclude = Prisma.validator<Prisma.ReminderInclude>()({
  task: true,
});
