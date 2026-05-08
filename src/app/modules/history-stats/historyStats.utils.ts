export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(2));
};

export const calculateSuccessRate = (success: number, total: number): number => {
  return calculatePercentage(success, total);
};

export const groupDataByDate = (data: any[], dateField: string = "createdAt") => {
  const grouped: Record<string, number> = {};
  data.forEach((item) => {
    const date = new Date(item[dateField]).toISOString().split("T")[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });
  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
};

export const normalizeStats = (data: any) => {
  return {
    ...data,
    updatedAt: new Date().toISOString(),
  };
};

export const formatChartData = (label: string, value: any) => ({
  label,
  value,
});

export const HistoryStatsUtils = {
  calculatePercentage,
  calculateSuccessRate,
  groupDataByDate,
  normalizeStats,
  formatChartData,
};
