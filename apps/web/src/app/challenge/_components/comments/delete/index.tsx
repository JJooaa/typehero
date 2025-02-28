import { type DialogTriggerProps } from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TypographyP,
  TypographyLarge,
  toast,
} from '@repo/ui';
import { deleteComment, type CommentsByChallengeId } from '../comment.action';
import { getRelativeTime } from '~/utils/relativeTime';
import { Markdown } from '~/components/ui/markdown';

interface CommentDeleteDialogProps extends DialogTriggerProps {
  comment: CommentsByChallengeId[number];
  queryKey?: (number | string)[];
}

export function CommentDeleteDialog({
  children,
  comment,
  queryKey,
  ...props
}: CommentDeleteDialogProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  async function handleDeleteComment() {
    try {
      await deleteComment(comment.id);
      toast({
        title: 'Comment Deleted',
        variant: 'success',
        description: 'The comment was successfully deleted.',
      });
    } catch (e) {
      // todo: log on a dump service.
      console.log(e);
      toast({
        title: 'Uh Oh!',
        variant: 'destructive',
        description: 'An error occurred while trying to delete the comment.',
      });
    } finally {
      queryClient.invalidateQueries(queryKey);
      setIsOpen(!isOpen);
    }
  }

  return (
    <Dialog onOpenChange={() => setIsOpen(!isOpen)} open={isOpen}>
      <DialogTrigger {...props}>{children}</DialogTrigger>
      <DialogContent className="flex flex-col space-y-2">
        <TypographyLarge>Are you sure?</TypographyLarge>

        <div className="flex flex-col gap-1 p-3 pt-2">
          <div className="flex items-start justify-between pr-[0.4rem]">
            <div className="flex items-center gap-1">
              <span className="-ml-[0.33rem] flex h-auto w-fit items-center rounded-full bg-transparent py-1 pl-[0.33rem] pr-2 text-xs font-bold text-neutral-700 hover:bg-black/10 dark:text-white dark:hover:bg-white/20">
                @{comment.user.name}
              </span>
              <Tooltip delayDuration={0.05}>
                <TooltipTrigger asChild>
                  <span className="mr-2 whitespace-nowrap text-sm text-neutral-500">
                    {getRelativeTime(comment.createdAt)}
                  </span>
                </TooltipTrigger>
                <TooltipContent align="start" className="rounded-xl">
                  <span className="text-white-500 text-xs">
                    {comment.createdAt.toLocaleString()}
                  </span>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="w-full break-words pl-[1px] text-sm">
            <Markdown>{comment.text}</Markdown>
          </div>
        </div>
        <TypographyP>The following comment will be permanently deleted.</TypographyP>
        <div className="flex flex-row gap-2">
          <Button onClick={() => setIsOpen(!isOpen)} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={() => {
              void handleDeleteComment();
            }}
            variant="destructive"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommentDeleteDialog;
