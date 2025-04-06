"use client";
import { useEffect, useState } from 'react';
import { COMETCHAT_CONSTANTS, initializeCometChat } from '@/lib/cometChatConfig';

const OFFICER_ID = "02fed0e2-777b-449d-ace2-3b392884753e";
const REPORT_ID = "5ab03973-4246-4509-a679-81ee21f8727c";

export function PoliceCommunicationHub() {
  const [cometChat, setCometChat] = useState<any>(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const initChat = async () => {
      try {
        const CometChat = await initializeCometChat();
        setCometChat(CometChat);

        // Login as officer
        const officerUID = `${COMETCHAT_CONSTANTS.UID_PREFIX.OFFICER}${OFFICER_ID}`;
        await CometChat.login(officerUID, COMETCHAT_CONSTANTS.AUTH_KEY);

        // Fetch conversations with report metadata
        const conversationsRequest = new CometChat.ConversationsRequestBuilder()
          .setLimit(30)
          .build();

        const fetchedConversations = await conversationsRequest.fetchNext();
        const filtered = fetchedConversations.filter(conv => 
          conv.getConversationId().includes(`REPORT_${REPORT_ID}`)
        );
        setConversations(filtered);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initChat();
  }, []);

  const openConversation = async (conversation) => {
    setActiveConversation(conversation);
    
    // Fetch messages with metadata filter
    const messagesRequest = new cometChat.MessagesRequestBuilder()
      .setConversationId(conversation.getConversationId())
      .setLimit(50)
      .build();

    const messages = await messagesRequest.fetchPrevious();
    setActiveConversation(prev => ({ ...prev, messages }));
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeConversation) return;

    const receiverID = activeConversation.getConversationWith().getUid();
    const conversationID = `REPORT_${REPORT_ID}`;

    const textMessage = new cometChat.TextMessage(
      receiverID,
      message,
      cometChat.RECEIVER_TYPE.USER,
      {
        conversationId: conversationID,
        metadata: { reportId: REPORT_ID }
      }
    );

    try {
      const sentMessage = await cometChat.sendMessage(textMessage);
      setMessage('');
      setActiveConversation(prev => ({
        ...prev,
        messages: [...prev.messages, sentMessage]
      }));
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-screen p-4">
      {/* Conversation List */}
      <div className="col-span-1 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Assigned Reports</h2>
        <div className="space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.getConversationId()}
              onClick={() => openConversation(conv)}
              className="p-3 hover:bg-gray-100 cursor-pointer rounded"
            >
              <p className="font-semibold">
                Report #{REPORT_ID.slice(0, 8)}
              </p>
              <p className="text-sm text-gray-600">
                With: {conv.getConversationWith().getName()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Chat */}
      <div className="col-span-2 bg-white rounded-lg shadow p-4">
        {activeConversation ? (
          <>
            <div className="chat-header mb-4">
              <h3 className="text-lg font-semibold">
                Case: {REPORT_ID.slice(0, 8)}
              </h3>
              <p>Chatting with {activeConversation.getConversationWith().getName()}</p>
            </div>

            <div className="chat-messages h-96 overflow-y-auto mb-4">
              {activeConversation.messages?.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.getSender().getUid() === 
                    `${COMETCHAT_CONSTANTS.UID_PREFIX.OFFICER}${OFFICER_ID}` ? 'officer' : 'user'}`}
                >
                  <p>{msg.getText()}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.getSentAt() * 1000).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="chat-input flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}