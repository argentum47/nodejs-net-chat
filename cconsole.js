module.exports = function(msg) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(msg);
}
