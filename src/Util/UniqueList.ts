const UniqueList = <T>(
  list: T[],
  key: (v: T) => unknown = (v) => v,
): T[] => {
  const onlyUnique = (value: T, index: number, self: T[]) =>
    self.findIndex((photo) => key(photo) === key(value)) === index;

  return list.filter(onlyUnique);
};
export default UniqueList;
