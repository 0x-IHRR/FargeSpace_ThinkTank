export const ROUTES = {
  home: "/",
  topicDetail: (slug: string) => `/topics/${slug}`,
  collectionDetail: (slug: string) => `/collections/${slug}`,
  packageDetail: (slug: string) => `/packages/${slug}`,
  search: "/search",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
} as const;

export const ROUTE_EXAMPLES = [
  ROUTES.home,
  ROUTES.topicDetail("agents"),
  ROUTES.collectionDetail("agentic-ai-watch"),
  ROUTES.packageDetail("openai-agent-builder-guide-digest"),
  ROUTES.search,
  ROUTES.login,
] as const;
