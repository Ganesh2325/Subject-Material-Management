import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['admin', 'faculty', 'student'],
      default: 'student',
      required: true
    },
    lastOpened: {
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        default: null
      },
      unitId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      },
      materialId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      },
      openedAt: {
        type: Date,
        default: null
      }
    },
    completedUnits: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
          required: true
        },
        unitId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        completedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

