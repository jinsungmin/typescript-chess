import * as mongoose from 'mongoose';

interface IUser {
    _id: string;
    email: string;
    username: string;
    password: string;
    win: number;
    lose: number;
}

const UserSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    win: Number,
    lose: Number
});

const UserModel = mongoose.model('User', UserSchema);

export { UserModel, IUser };