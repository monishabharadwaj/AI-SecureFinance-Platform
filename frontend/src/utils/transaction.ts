export function getTransactionStyles(type: string, isFlagged: boolean = false) {
  const isCredit = type === 'income' || type === 'credit';
  
  if (isCredit) {
    return {
      colorClass: 'text-green-600',
      bgClass: 'bg-green-50',
      badgeClass: 'bg-green-100 text-green-700',
      sign: '+',
      isFlagged: false, // NEVER flag credit
    };
  }

  return {
    colorClass: 'text-red-600',
    bgClass: isFlagged ? 'bg-red-50/50' : 'bg-white',
    badgeClass: 'bg-secondary text-secondary-foreground',
    sign: '-',
    isFlagged: isFlagged,
  };
}
