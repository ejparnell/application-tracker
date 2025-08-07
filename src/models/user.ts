import { Schema, models, model, InferSchemaType } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: true, minlength: 6, select: false },
    },
    { timestamps: true }
);

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password as string, 12);
});

export type UserDoc = InferSchemaType<typeof UserSchema>;
export const User = models.User<UserDoc> || model<UserDoc>('User', UserSchema);
