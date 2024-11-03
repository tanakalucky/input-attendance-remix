import { z, ZodIssueCode } from 'zod';

export const schema = z
  .object({
    loginId: z.string().min(1),
    loginPw: z.string().min(1),
    attendances: z
      .string()
      .min(1)
      .transform((val) => {
        return val.replace(/\s/g, '');
      })
      .superRefine((val, ctx) => {
        let parsedData;

        try {
          parsedData = JSON.parse(val);
        } catch {
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message: 'Invalid json format',
          });

          return;
        }

        const { year, month, attendances } = parsedData;

        const yearError = yearSchema.safeParse(year).error;
        if (yearError) {
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message: `Year error: ${yearError.errors[0].message}`,
          });

          return;
        }

        const monthError = monthSchema.safeParse(month).error;
        if (monthError) {
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message: `Month error: ${monthError.errors[0].message}`,
          });
          return;
        }

        const attendancesError = attendancesSchema.safeParse(attendances).error;
        if (attendancesError) {
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message: `Attendances.${attendancesError.errors[0].path[1]} error: ${attendancesError.errors[0].message}`,
          });
        }
      })
      .transform((val) => {
        const { year, month, attendances } = JSON.parse(val);
        return {
          year: yearSchema.parse(year),
          month: monthSchema.parse(month),
          attendances: attendancesSchema.parse(attendances),
        };
      }),
  })
  .transform((val) => {
    const data = {
      loginId: val.loginId,
      loginPw: val.loginPw,
      year: val.attendances.year,
      month: val.attendances.month,
      attendances: val.attendances.attendances,
    };

    return data;
  });

const yearSchema = z.number().int();
const monthSchema = z.number().int().min(1).max(12);
const attendancesSchema = z
  .object({
    date: z
      .string()
      .min(1)
      .refine(
        (val) => {
          try {
            new Date(val);
          } catch {
            return false;
          }
        },
        { message: 'Invalid date format' },
      ),
    start_time: z.string(),
    end_time: z.string(),
    break_time: z.string(),
  })
  .array();
