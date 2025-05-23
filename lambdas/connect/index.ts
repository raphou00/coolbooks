exports.handler = (event: unknown, context: unknown) => {
    const res = {
        statusCode: 200,
        body: JSON.stringify({ message: "Connected" }),
    };
    return res;
}
