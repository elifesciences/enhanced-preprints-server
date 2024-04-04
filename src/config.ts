export const config = {
  port: process.env.PORT ?? 3000,
  repoConnection: process.env.REPO_CONNECTION ?? '',
  repoUserName: process.env.REPO_USERNAME ?? '',
  repoPassword: process.env.REPO_PASSWORD ?? '',
  elifeMetricsUrl: process.env.ELIFE_METRICS_URL,
};
