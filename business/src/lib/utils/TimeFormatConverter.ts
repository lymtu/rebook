export const formatTime = (
  time: string | number,
  isMore: boolean = true
): string => {
  const datetime = new Date(time);
  const year = datetime.getFullYear().toString();
  const month = (datetime.getMonth() + 1).toString().padStart(2, "0");
  const date = datetime.getDate().toString().padStart(2, "0");
  const hour = datetime.getHours().toString().padStart(2, "0");
  const minute = datetime.getMinutes().toString().padStart(2, "0");
  const second = datetime.getSeconds().toString().padStart(2, "0");

  if (isMore) {
    return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
  }

  return `${year}-${month}-${date}`;
};
