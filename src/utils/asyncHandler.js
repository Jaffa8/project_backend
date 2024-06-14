 const asyncHandler = (fn) => (req, res, next) =>{
    Promise.resolve(fn(req, res, next)).catch(next).
    catch((err) => {
        console.log(err);
        res.status(500).json({message: 'Internal server error'});
    });
};
export default asyncHandler;