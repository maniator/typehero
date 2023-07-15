'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Delete } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ChallengeRouteData } from '~/app/challenge/[id]/getChallengeRouteData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { getRelativeTime } from '~/utils/relativeTime';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Form, FormField, FormItem } from '~/components/ui/form';
import { Textarea } from '~/components/ui/textarea';
import { TypographyLarge } from '~/components/ui/typography/large';
import { toast } from '~/components/ui/use-toast';
import { reportChallengeComment } from './comment.action';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { UserBadge } from '~/components/ui/user-badge';

interface CommentProps {
  comment: ChallengeRouteData['comment'][number];
}

const commentReportSchema = z
  .object({
    spam: z.boolean().optional(),
    threat: z.boolean().optional(),
    hate_speech: z.boolean().optional(),
    bullying: z.boolean().optional(),
    text: z.string().optional(),
  })
  .refine(
    (obj) => {
      const { spam, threat, hate_speech, bullying, text } = obj;
      return spam || threat || hate_speech || bullying || (text !== undefined && text !== '');
    },
    {
      path: ['text'],
      message: 'Your report should include an issue or a reason.',
    },
  );

export type CommentReportSchemaType = z.infer<typeof commentReportSchema>;

const Comment = ({ comment }: CommentProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<CommentReportSchemaType>({
    resolver: zodResolver(commentReportSchema),
    mode: 'onChange',
    defaultValues: {
      bullying: false,
      hate_speech: false,
      spam: false,
      text: '',
      threat: false,
    },
  });

  async function copyPathNotifyUser() {
    try {
      await copyCommentUrlToClipboard();
      toast({
        title: 'Success!',
        variant: 'success',
        description: <p>Copied comment URL to clipboard!</p>,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failure!',
        variant: 'destructive',
        description: <p>Something went wrong!</p>,
      });
    }
  }

  async function copyCommentUrlToClipboard() {
    await navigator.clipboard.writeText(`${window.location.href}/comment/${comment.id}`);
  }

  async function handleCommentReport(data: CommentReportSchemaType) {
    try {
      const res = await reportChallengeComment(data, comment.id);
      if (res === 'unauthorized') {
        toast({
          title: 'Unauthorized',
          variant: 'destructive',
          description: <p>You&apos;re not authorized to perform the action.</p>,
        });
      } else if (res === 'already_exists') {
        toast({
          title: 'Already Reported',
          description: <p>The comment you&apos;re trying to report has already been reported.</p>,
        });
      } else {
        toast({
          title: 'Reported',
          variant: 'success',
          description: <p>The comment has successfully been reported.</p>,
        });
        setDialogOpen(false);
        form.reset();
      }
    } catch (e) {
      toast({
        title: 'Uh Oh!',
        variant: 'destructive',
        description: <p>There was an error while trying to report the comment.</p>,
      });
    }
  }

  const text = form.watch('text');

  return (
    <div className="flex cursor-pointer flex-col gap-2 p-4 pt-2 duration-300 hover:bg-neutral-100 dark:rounded-none dark:hover:bg-zinc-700/50">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <UserBadge username={comment.user.name} />
          <Tooltip delayDuration={0.05}>
            <TooltipTrigger asChild>
              <span className="text-sm text-neutral-500">{getRelativeTime(comment.createdAt)}</span>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-white-500 text-sm">{comment.createdAt.toLocaleString()}</span>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center">
          <div
            onClick={() => {
              copyPathNotifyUser();
            }}
            className="mr-2 flex items-center text-neutral-500 hover:text-[#007bcd]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-share "
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" x2="12" y1="2" y2="15" />
            </svg>
            <small className="font-md text-sm leading-none hover:underline">Share</small>
          </div>
          <button
            onClick={() => {
              setDialogOpen(true);
            }}
            className="flex text-sm text-neutral-400 hover:text-neutral-400 hover:underline dark:text-neutral-600"
          >
            Report
          </button>
        </div>
      </div>
      <p className="w-full break-words">{comment.text}</p>
      <Dialog
        open={dialogOpen}
        onOpenChange={() => {
          setDialogOpen(!dialogOpen);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="flex flex-col space-y-2 rounded-3xl border bg-zinc-900 p-3">
              <div className="flex items-center gap-2">
                <UserBadge username={comment.user.name} />
                <Tooltip>
                  <span className="text-sm text-neutral-500">
                    {getRelativeTime(comment.createdAt)}
                  </span>
                  <TooltipContent>
                    <p>Add to library</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p>{comment.text}</p>
              <div className="flex">
                {/* UPVOTE */}
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-arrow-big-up stroke-neutral-500 hover:stroke-white"
                  >
                    <path d="M9 18v-6H5l7-7 7 7h-4v6H9z" />
                  </svg>
                </div>
                {/* VOTE COUNT */}
                <div className="text-neutral-500 hover:text-white">0</div>
                {/* DOWNVOTE */}
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-arrow-big-down stroke-neutral-500 hover:stroke-white"
                  >
                    <path d="M15 6v6h4l-7 7-7-7h4V6h6z" />
                  </svg>
                </div>
              </div>
            </div>

            <Form {...form}>
              {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
              <form onSubmit={form.handleSubmit(handleCommentReport)}>
                <div className="py-2">
                  <TypographyLarge>Issues</TypographyLarge>
                </div>
                <div className="flex flex-col space-y-2 px-2">
                  <FormField
                    control={form.control}
                    name="bullying"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <div className="flex items-center gap-4">
                            <Checkbox
                              id="bullying"
                              checked={field.value as boolean}
                              onCheckedChange={(e) => {
                                if (typeof e === 'boolean') {
                                  field.onChange(e);
                                }
                              }}
                            />
                            <label htmlFor="bullying">The comment suggests bullying.</label>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="hate_speech"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <div className="flex items-center gap-4">
                            <Checkbox
                              id="hate_speech"
                              checked={field.value as boolean}
                              onCheckedChange={(e) => {
                                if (typeof e === 'boolean') {
                                  field.onChange(e);
                                }
                              }}
                            />
                            <label htmlFor="hate_speech">The comment suggests hate speech.</label>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="spam"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <div className="flex items-center gap-4">
                            <Checkbox
                              id="spam"
                              checked={field.value as boolean}
                              onCheckedChange={(e) => {
                                if (typeof e === 'boolean') {
                                  field.onChange(e);
                                }
                              }}
                            />
                            <label htmlFor="spam">The comment suggests spam.</label>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="threat"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <div className="flex items-center gap-4">
                            <Checkbox
                              id="threat"
                              checked={field.value as boolean}
                              onCheckedChange={(e) => {
                                if (typeof e === 'boolean') {
                                  field.onChange(e);
                                }
                              }}
                            />
                            <label htmlFor="threat">The comment suggests threat/s.</label>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <div className="flex flex-row items-center gap-2">
                            <label className="-ml-2" htmlFor="text">
                              <TypographyLarge>Other</TypographyLarge>
                            </label>
                            {text !== undefined && text.length > 0 && (
                              <Delete
                                className="h-5 w-5 hover:cursor-pointer"
                                onClick={() => {
                                  form.setValue('text', '');
                                }}
                              />
                            )}
                          </div>
                          <Textarea value={field.value} onChange={field.onChange} />
                        </FormItem>
                      );
                    }}
                  />
                  {form.formState.errors.text?.message && (
                    <p className={'text-sm font-medium text-destructive'}>
                      {form.formState.errors.text.message}
                    </p>
                  )}
                </div>

                <div className="flex pt-4">
                  <Button type="submit" className="w-full">
                    Report
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Comment;
