

const generateContent = async (id: string) => {
  return await prisma.review.delete({
    where: { id },
  });
};

export const AiService = {
  generateContent,
}