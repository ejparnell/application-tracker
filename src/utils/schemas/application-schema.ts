import { z } from 'zod';

const applicationSchema = z.object({
    title: z
        .string()
        .min(1, { message: 'Job title is required' })
        .max(200, { message: 'Job title must be at most 200 characters long' }),
    
    company: z
        .string()
        .min(1, { message: 'Company name is required' })
        .max(100, { message: 'Company name must be at most 100 characters long' }),
    
    location: z
        .string()
        .max(100, { message: 'Location must be at most 100 characters long' })
        .optional()
        .or(z.literal('')),
    
    jobUrl: z
        .string()
        .url({ message: 'Please enter a valid URL' })
        .min(1, { message: 'Job URL is required' }),
    
    description: z
        .string()
        .min(10, { message: 'Job description must be at least 10 characters long' })
        .max(10000, { message: 'Job description must be at most 10,000 characters long' }),
    
    salary: z
        .string()
        .max(50, { message: 'Salary must be at most 50 characters long' })
        .optional()
        .or(z.literal('')),
    
    status: z
        .enum(['available', 'applied', 'interview', 'rejected', 'hidden'], {
            message: 'Please select a valid status'
        })
        .default('available'),
    
    notes: z
        .string()
        .max(5000, { message: 'Notes must be at most 5,000 characters long' })
        .optional()
        .or(z.literal(''))
});

export { applicationSchema };
export type ApplicationFormData = z.infer<typeof applicationSchema>;
