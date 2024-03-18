const params = {
    key1: true,
    key2: false,
    key3: true,
    key4: false,
};

Object.entries(params).forEach(([key, value]) => {
    console.log(key, value);
})