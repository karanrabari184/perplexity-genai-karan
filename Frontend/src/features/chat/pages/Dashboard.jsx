import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useChat } from '../hook/useChat'
import remarkGfm from 'remark-gfm'
import AuthRequiredModal from '../../auth/components/AuthRequiredModal'
import { consumePendingChatMessage } from '../../auth/constants/pendingMessage'

const Dashboard = () => {
  const chat = useChat()

  const user = useSelector((state) => state.auth.user)
  const authLoading = useSelector((state) => state.auth.loading)
  const chats = useSelector((state) => state.chat.chats)
  const currentChatId = useSelector((state) => state.chat.currentChatId)
  const isLoading = useSelector((state) => state.chat.isLoading)
  const error = useSelector((state) => state.chat.error)

  const [chatInput, setChatInput] = useState('')
  const [authModalOpen, setAuthModalOpen] = useState(false)


  useEffect(() => {
    const pending = consumePendingChatMessage()
    if (pending) {
      setChatInput(pending)
    }
  }, [])

  useEffect(() => {
    if (!user) return undefined

    const disconnectSocket = chat.connectSocket()
    chat.handleGetChats()
    return () => disconnectSocket?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleSubmitMessage = async (event) => {
    event.preventDefault()

    const trimmedMessage = chatInput.trim()

    if (!trimmedMessage || isLoading || authLoading) {
      return
    }

    if (!user) {
      setAuthModalOpen(true)
      return
    }

    setChatInput('')

    try {
      await chat.handleSendMessage({
        message: trimmedMessage,
        chatId: currentChatId,
      })
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats)
  }

  const createNewChat = () => {
    // no dedicated action needed — passing chatId: null on next send
    // creates a new chat; we just clear the "active" view here
    setChatInput('')
    chat.handleOpenChat(null, chats)
  }

  const currentChat = currentChatId ? chats[currentChatId] : null
  const displayName = user?.username || 'Guest'
  const profileInitial = displayName.charAt(0).toUpperCase()

  return (
    <main className='flex h-screen w-full overflow-hidden bg-[#191919] text-white'>

      <AuthRequiredModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        pendingMessage={chatInput}
      />

      {/* SIDEBAR */}
      <aside className='hidden w-[280px] shrink-0 flex-col bg-[#171717] md:flex'>

        <div className='flex items-center justify-between px-4 py-4'>
          <h1 className='text-[20px] font-semibold tracking-tight text-white'>
            Perplexity
          </h1>

          <button
            type='button'
            onClick={createNewChat}
            className='flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white'
            title='New chat'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M12 5v14' />
              <path d='M5 12h14' />
            </svg>
          </button>
        </div>

        <div className='px-3 pb-4'>
          <button
            type='button'
            onClick={createNewChat}
            className='flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/80 transition hover:bg-white/[0.07] hover:text-white'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M12 5v14' />
              <path d='M5 12h14' />
            </svg>

            New chat
          </button>
        </div>

        <div className='flex-1 overflow-y-auto px-3'>
          <p className='mb-2 px-3 text-xs font-medium uppercase tracking-wider text-white/35'>
            Recent
          </p>

          <div className='space-y-1'>
            {Object.values(chats)
              .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
              .map((chatItem) => (
              <button
                key={chatItem.id}
                type='button'
                onClick={() => openChat(chatItem.id)}
                className={`group flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  currentChatId === chatItem.id
                    ? 'bg-white/[0.09] text-white'
                    : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <span className='truncate'>
                  {chatItem.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className='border-t border-white/[0.06] p-3'>
          {user ? (
            <Link
              to='/profile'
              className='flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.06]'
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#31b8c6] text-sm font-semibold text-zinc-950'>
                {profileInitial}
              </div>

              <div className='min-w-0'>
                <p className='truncate text-sm font-medium text-white'>
                  {displayName}
                </p>

                <p className='text-xs text-white/40'>
                  Profile
                </p>
              </div>
            </Link>
          ) : (
            <div className='rounded-xl px-3 py-2.5'>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/70'>
                  G
                </div>

                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium text-white'>
                    Guest
                  </p>

                  <p className='text-xs text-white/40'>
                    Login to save chats
                  </p>
                </div>
              </div>

              <div className='mt-3 flex gap-2'>
                <Link
                  to='/login'
                  className='flex-1 rounded-lg bg-white/10 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-white/15'
                >
                  Login
                </Link>

                <Link
                  to='/register'
                  className='flex-1 rounded-lg border border-white/10 px-3 py-2 text-center text-xs font-medium text-white/80 transition hover:bg-white/[0.06]'
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>

      </aside>

      {/* MAIN CHAT */}
      <section className='relative flex min-w-0 flex-1 flex-col bg-[#191919]'>

        {/* TOP BAR */}
        <header className='flex h-14 shrink-0 items-center justify-between border-b border-white/[0.05] px-4 md:px-6'>

          <div className='flex items-center gap-3'>

            <div className='flex items-center gap-2 md:hidden'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-black'>
                P
              </div>

              <span className='font-semibold'>
                Perplexity
              </span>
            </div>

            {currentChat && (
              <span className='hidden text-sm text-white/50 sm:block'>
                {currentChat.title}
              </span>
            )}

          </div>

          {user ? (
            <Link
              to='/profile'
              className='flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-white/70 transition hover:bg-white/[0.07] hover:text-white'
            >
              <span className='flex h-7 w-7 items-center justify-center rounded-full bg-[#31b8c6] text-xs font-bold text-zinc-950'>
                {profileInitial}
              </span>
              <span className='hidden sm:inline'>Profile</span>
            </Link>
          ) : (
            <Link
              to='/login'
              className='rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.07] hover:text-white'
            >
              Login
            </Link>
          )}

        </header>

        {/* MESSAGE AREA */}
        <div className='relative flex-1 overflow-hidden'>

          <div className='h-full overflow-y-auto px-4 pb-40 pt-8 md:px-8'>

            {error && (
              <div className='mx-auto mb-4 w-full max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300'>
                {error}
              </div>
            )}

            {!currentChat ? (

              <div className='flex h-full flex-col items-center justify-center pb-20'>

                <div className='mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-bold text-black shadow-lg'>
                  P
                </div>

                <h2 className='text-center text-3xl font-semibold tracking-tight text-white md:text-4xl'>
                  How can I help you?
                </h2>

                <p className='mt-3 max-w-md text-center text-sm leading-6 text-white/40 md:text-base'>
                  Ask anything, explore ideas, or start a conversation.
                </p>

                <div className='mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2'>

                  <button
                    type='button'
                    onClick={() => setChatInput('Explain something to me')}
                    className='rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition hover:border-white/[0.15] hover:bg-white/[0.05]'
                  >
                    <p className='text-sm font-medium text-white/80'>
                      Explain something
                    </p>

                    <p className='mt-1 text-xs text-white/35'>
                      Learn about any topic
                    </p>
                  </button>

                  <button
                    type='button'
                    onClick={() =>
                      setChatInput('Help me brainstorm some ideas')
                    }
                    className='rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition hover:border-white/[0.15] hover:bg-white/[0.05]'
                  >
                    <p className='text-sm font-medium text-white/80'>
                      Brainstorm ideas
                    </p>

                    <p className='mt-1 text-xs text-white/35'>
                      Explore creative possibilities
                    </p>
                  </button>

                </div>

              </div>

            ) : (

              <div className='mx-auto flex w-full max-w-3xl flex-col gap-8'>

                {currentChat.messages.map((message, index) => (

                  <div
                    key={`${currentChatId}-${index}`}
                    className={`flex w-full ${
                      message.role === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >

                    {message.role === 'user' ? (

                      <div className='max-w-[80%] rounded-3xl rounded-br-md bg-[#2f2f2f] px-5 py-3.5 text-[15px] leading-6 text-white'>
                        {message.content}
                      </div>

                    ) : (

                      <div className='flex max-w-[90%] gap-3'>

                        <div className='mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-black'>
                          P
                        </div>

                        <div className='min-w-0 pt-0.5 text-[15px] leading-7 text-white/85'>

                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className='mb-3 last:mb-0'>
                                  {children}
                                </p>
                              ),

                              ul: ({ children }) => (
                                <ul className='mb-3 list-disc space-y-1 pl-6'>
                                  {children}
                                </ul>
                              ),

                              ol: ({ children }) => (
                                <ol className='mb-3 list-decimal space-y-1 pl-6'>
                                  {children}
                                </ol>
                              ),

                              h1: ({ children }) => (
                                <h1 className='mb-3 mt-5 text-2xl font-semibold text-white'>
                                  {children}
                                </h1>
                              ),

                              h2: ({ children }) => (
                                <h2 className='mb-3 mt-5 text-xl font-semibold text-white'>
                                  {children}
                                </h2>
                              ),

                              h3: ({ children }) => (
                                <h3 className='mb-2 mt-4 text-lg font-semibold text-white'>
                                  {children}
                                </h3>
                              ),

                              code: ({ children }) => (
                                <code className='rounded-md bg-white/[0.08] px-1.5 py-1 font-mono text-sm text-white/90'>
                                  {children}
                                </code>
                              ),

                              pre: ({ children }) => (
                                <pre className='my-4 overflow-x-auto rounded-xl border border-white/[0.06] bg-[#101010] p-4 text-sm leading-6'>
                                  {children}
                                </pre>
                              ),

                              blockquote: ({ children }) => (
                                <blockquote className='my-4 border-l-2 border-white/20 pl-4 text-white/50'>
                                  {children}
                                </blockquote>
                              ),
                            }}
                            remarkPlugins={[remarkGfm]}
                          >
                            {message.content}
                          </ReactMarkdown>

                        </div>

                      </div>
                    )}

                  </div>

                ))}

                {isLoading && !currentChat?.messages?.some((m) => m.streaming) && (
                  <div className='flex w-full justify-start'>
                    <div className='flex max-w-[90%] gap-3'>
                      <div className='mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-black'>
                        P
                      </div>
                      <div className='pt-1.5 text-sm text-white/40'>
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}

              </div>

            )}

          </div>

        </div>

        {/* COMPOSER */}
        <div className='pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#191919] via-[#191919]/95 to-transparent px-4 pb-5 pt-12 md:px-8'>

          <div className='pointer-events-auto mx-auto w-full max-w-3xl'>

            <form
              onSubmit={handleSubmitMessage}
              className='relative rounded-3xl border border-white/[0.12] bg-[#242424] p-2 shadow-2xl shadow-black/30 transition focus-within:border-white/[0.22]'
            >

              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    handleSubmitMessage(event)
                  }
                }}
                placeholder='Message Perplexity...'
                rows={1}
                className='w-full resize-none bg-transparent px-4 py-3 pr-14 text-[15px] text-white outline-none placeholder:text-white/35'
              />

              <button
                type='submit'
                disabled={!chatInput.trim() || isLoading || authLoading}
                className='absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='m5 12 14-7-4 14-3-6-7-1Z' />
                  <path d='M12 13 19 5' />
                </svg>
              </button>

            </form>

            <p className='mt-2 text-center text-[11px] text-white/25'>
              Perplexity can make mistakes. Check important information.
            </p>

          </div>

        </div>

      </section>

    </main>
  )
}

export default Dashboard