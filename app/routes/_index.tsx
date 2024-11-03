import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { ActionFunctionArgs, redirect, type MetaFunction } from '@remix-run/cloudflare';
import { useActionData, Form, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { schema } from '~/schema';

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const env = context.cloudflare.env as Env;

  try {
    const response = await fetch(env.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission.value),
    });

    if (response.status !== 200) {
      return submission.reply({
        formErrors: ['Failed to input attendance.'],
      });
    }
  } catch {
    return submission.reply({
      formErrors: ['Failed to input attendance. Please try again later.'],
    });
  }

  return redirect('/');
}

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

export default function Index() {
  const lastResult = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  useEffect(() => {
    const errors = form.errors ?? [];
    if (navigation.state === 'idle' && errors.length === 0) {
      form.reset();

      toast.success('Input attendance completed!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prevent infinit loop
  }, [navigation.state]);

  return (
    <div className='w-full h-full'>
      <Form method='POST' {...getFormProps(form)} className='flex flex-col w-[50%] m-auto gap-4'>
        <div id={form.errorId} className='text-red-500'>
          {form.errors}
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor={fields.loginId.id}>login id</Label>
          <Input {...getInputProps(fields.loginId, { type: 'text' })} aria-invalid={Boolean(fields.loginId.errors)} />
          <div id={fields.loginId.errorId} className='text-red-500'>
            {fields.loginId.errors}
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor={fields.loginPw.id}>login password</Label>
          <Input
            {...getInputProps(fields.loginPw, { type: 'password' })}
            aria-invalid={Boolean(fields.loginPw.errors)}
          />
          <div id={fields.loginPw.errorId} className='text-red-500'>
            {fields.loginPw.errors}
          </div>
        </div>

        <div className='flex flex-col flex-1 gap-2'>
          <Label htmlFor={fields.attendances.id}>attendances</Label>
          <Textarea
            {...getInputProps(fields.attendances, { type: 'text' })}
            className='h-64'
            aria-invalid={Boolean(fields.attendances.errors)}
          />
          <div id={fields.attendances.errorId} className='text-red-500'>
            {fields.attendances.errors}
          </div>
        </div>

        <Button>Send</Button>
      </Form>

      <AlertDialog open={isSubmitting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Processing...</AlertDialogTitle>
            <AlertDialogDescription>
              Please wait. This process takes approximately 1 minute. Do not close the browser.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
