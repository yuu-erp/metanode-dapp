import { useCurrentState } from '@/hooks/use-current-state'
import { handleSendMessage } from '@/new/message/send-message-v4'
import ConversationContact from '@/shared/components/conversation-contact'
import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog'
import { memo, useState, type PropsWithChildren } from 'react'
import { useGetConversations } from '../conversation'

export type ShareMeetingModalProps = PropsWithChildren & {
  url?: string
}

export const ShareMeetingModal = memo(({ children, url }: ShareMeetingModalProps) => {
  const { account } = useCurrentState()
  const [open, setOpen] = useState(false)

  const { data: conversations = [] } = useGetConversations(account)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="max-h-100 overflow-y-auto">
          <div className="flex flex-col  gap-3">
            {conversations.map((item) => (
              <ConversationContact
                key={item.conversationId}
                name={item.name}
                username={item.username}
                type={item.conversationType}
                onClick={() => {
                  setOpen(false)
                  handleSendMessage(
                    {
                      type: 'text',
                      content: url
                    },
                    {
                      id: item.conversationId,
                      type: item.conversationType
                    }
                  )

                  // submit({
                  //   value: url,
                  //   base: {
                  //     id: item.conversationId,
                  //     type: item.conversationType
                  //   }
                  // })
                }}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})
