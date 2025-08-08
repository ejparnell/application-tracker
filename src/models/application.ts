import { Schema, models, model, Document, Model, Types } from 'mongoose';

interface IApplication extends Document {
    id: number;
    title: string;
    company: string;
    location?: string;
    date: string;
    daysAgo?: string;
    jobUrl: string;
    description: string;
    
    status: 'available' | 'applied' | 'interview' | 'rejected' | 'hidden';
    
    flags: {
        applied: boolean;
        hidden: boolean;
        interview: boolean;
        rejected: boolean;
    };
    dateLoaded: string;
    userId: Types.ObjectId;
    appliedAt?: Date;
    interviewDate?: Date;
    notes?: string;
    resumeContent?: string;
    coverLetter?: string;
    salary?: string;
    
    // Mongoose timestamps
    createdAt: Date;
    updatedAt: Date;
    
    daysSinceApplied?: number;
    updateStatus(newStatus: string): Promise<IApplication>;
}

interface IApplicationModel extends Model<IApplication> {
    findByStatus(userId: string, status: string): Promise<IApplication[]>;
    getStats(userId: string): Promise<Array<{ _id: string; count: number }>>;
}

const ApplicationSchema = new Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 200,
            trim: true,
        },
        company: {
            type: String,
            required: true,
            maxlength: 100,
            trim: true,
        },
        location: {
            type: String,
            maxlength: 100,
            trim: true,
        },
        date: {
            type: String,
            required: true,
        },
        daysAgo: {
            type: String,
        },
        jobUrl: {
            type: String,
            required: true,
            validate: {
                validator: function(v: string) {
                    return /^https?:\/\/.+/.test(v);
                },
                message: 'Job URL must be a valid URL'
            }
        },
        description: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            required: true,
            enum: ['available', 'applied', 'interview', 'rejected', 'hidden'],
            default: 'available',
        },
        
        flags: {
            applied: {
                type: Boolean,
                default: false,
            },
            hidden: {
                type: Boolean,
                default: false,
            },
            interview: {
                type: Boolean,
                default: false,
            },
            rejected: {
                type: Boolean,
                default: false,
            },
        },
        
        dateLoaded: {
            type: String,
            required: true,
        },
        
        userId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        
        appliedAt: {
            type: Date,
        },
        interviewDate: {
            type: Date,
        },
        notes: {
            type: String,
            maxlength: 2000,
        },
        
        resumeContent: {
            type: String,
        },
        coverLetter: {
            type: String,
        },
        
        salary: {
            type: String,
            maxlength: 50,
        },
    },
    { 
        timestamps: true 
    }
);

ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ userId: 1, 'flags.applied': 1 });
ApplicationSchema.index({ userId: 1, appliedAt: -1 });
ApplicationSchema.index({ id: 1, userId: 1 }, { unique: true });

ApplicationSchema.virtual('daysSinceApplied').get(function() {
    if (!this.appliedAt) return null;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.appliedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

ApplicationSchema.methods.updateStatus = function(newStatus: string) {
    this.status = newStatus;
    
    this.flags.applied = false;
    this.flags.hidden = false;
    this.flags.interview = false;
    this.flags.rejected = false;
    
    switch (newStatus) {
        case 'applied':
            this.flags.applied = true;
            if (!this.appliedAt) {
                this.appliedAt = new Date();
            }
            break;
        case 'interview':
            this.flags.applied = true;
            this.flags.interview = true;
            break;
        case 'rejected':
            this.flags.rejected = true;
            break;
        case 'hidden':
            this.flags.hidden = true;
            break;
    }
    
    return this.save();
};

ApplicationSchema.statics.findByStatus = function(userId: string, status: string) {
    return this.find({ userId, status }).sort({ updatedAt: -1 });
};

ApplicationSchema.statics.getStats = function(userId: string) {
    return this.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
};

export type ApplicationDoc = IApplication;
export const Application = (models.Application as IApplicationModel) || model<IApplication, IApplicationModel>('Application', ApplicationSchema);
