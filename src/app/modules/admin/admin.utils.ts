export const calculateAICost = ({
  provider,
  model,
  tokensUsed,
}: {
  provider: string;
  model: string;
  tokensUsed: number;
}) => {
  const providerLower = provider.toLowerCase();
  let rate = 0.01; // default rate per 1000 tokens

  if (providerLower.includes("openai")) {
    rate = 0.02; // example rate
  } else if (providerLower.includes("gemini")) {
    rate = 0.005;
  } else if (providerLower.includes("claude")) {
    rate = 0.03;
  }

  return (tokensUsed / 1000) * rate;
};

export const formatDashboardMetrics = (data: any) => {
  return {
    ...data,
    timestamp: new Date().toISOString(),
  };
};

export const normalizeChartData = (data: any[]) => {
  return data.map((item) => ({
    label: item.label,
    value: item.value,
  }));
};

export const AdminUtils = {
  calculateAICost,
  formatDashboardMetrics,
  normalizeChartData,
};
