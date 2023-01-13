export const getPage = (path: string) => {
  const pathItems = path.split('/');
  return {
    line: pathItems[1],
    datapage: pathItems[2],
  };
};
