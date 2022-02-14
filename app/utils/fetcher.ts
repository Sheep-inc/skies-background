export const fetcher = async (endPt: string) => {
  const res = await fetch(endPt,{mode:"no-cors"});
  if (res.ok) {
    return await res.json();
  }
  return undefined;
};
