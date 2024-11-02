import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, redirect, type MetaFunction } from '@remix-run/cloudflare';
import { useActionData, Form } from '@remix-run/react';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';

const schema = z
  .object({
    loginId: z.string().min(1),
    loginPw: z.string().min(1),
    attendances: z.string().min(1),
  })
  .transform((val) => {
    const { year, month, attendances } = JSON.parse(val.attendances.replace(/\s+/g, ''));

    const data = {
      loginId: val.loginId,
      loginPw: val.loginPw,
      year: Number(year),
      month: Number(month),
      attendances,
    };

    return data;
  });

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const env = context.cloudflare.env as Env;

  await fetch(env.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(submission.value),
  });

  return redirect('/');
}

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

export default function Index() {
  const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <div className='w-full h-full'>
      <Form method='POST' {...getFormProps(form)} className='flex flex-col w-[50%] m-auto gap-4'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor={fields.loginId.id}>login id</Label>
          <Input {...getInputProps(fields.loginId, { type: 'text' })} />
          <div id={fields.loginId.errorId} className='text-red-500'>
            {fields.loginId.errors}
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor={fields.loginPw.id}>login password</Label>
          <Input {...getInputProps(fields.loginPw, { type: 'password' })} />
          <div id={fields.loginPw.errorId} className='text-red-500'>
            {fields.loginPw.errors}
          </div>
        </div>

        <div className='flex flex-col flex-1 gap-2'>
          <Label htmlFor={fields.attendances.id}>attendances</Label>
          <Textarea {...getInputProps(fields.attendances, { type: 'text' })} className='h-50' />
          <div id={fields.attendances.errorId} className='text-red-500'>
            {fields.attendances.errors}
          </div>
        </div>

        <Button>Send</Button>
      </Form>
    </div>
  );
}
