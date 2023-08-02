
const UniqueList = (list, key = (v) => v) => {
    const onlyUnique = (value, index, self) => self.findIndex(photo => key(photo) === key(value)) === index;

    return list.filter(onlyUnique);
};

export default UniqueList;
