import React, { createContext, useContext, Dispatch } from 'react';
import { usePersistedReducer } from '../hooks/usePersistedReducer';
import type { NotificationState, NotificationAction, Notification } from '../types/notification';
import { INITIAL_NOTIFICATION_STATE, simulateDelivery } from '../data/notificationData';

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SEND_NOTIFICATION': {
      const notif: Notification = {
        ...action.payload,
        status: 'sent',
        sentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deliveryStats: simulateDelivery(action.payload),
      };
      return {
        ...state,
        notifications: [notif, ...state.notifications.filter(n => n.id !== notif.id)],
        activeDraft: null,
      };
    }

    case 'SAVE_DRAFT': {
      const draft: Notification = {
        ...action.payload,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      };
      const exists = state.notifications.some(n => n.id === draft.id);
      return {
        ...state,
        notifications: exists
          ? state.notifications.map(n => n.id === draft.id ? draft : n)
          : [draft, ...state.notifications],
      };
    }

    case 'UPDATE_DRAFT': {
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload.id ? { ...n, ...action.payload, updatedAt: new Date().toISOString() } : n
        ),
      };
    }

    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case 'DUPLICATE_NOTIFICATION': {
      const original = state.notifications.find(n => n.id === action.payload);
      if (!original) return state;
      const duplicate: Notification = {
        ...original,
        id: `notif-${Date.now()}`,
        status: 'draft',
        title: `${original.title} (نسخة)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sentAt: undefined,
        sendAt: null,
        deliveryStats: undefined,
      };
      return {
        ...state,
        notifications: [duplicate, ...state.notifications],
      };
    }

    case 'CANCEL_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, status: 'cancelled', updatedAt: new Date().toISOString() } : n
        ),
      };

    case 'SAVE_TEMPLATE':
      return {
        ...state,
        templates: [action.payload, ...state.templates.filter(t => t.id !== action.payload.id)],
      };

    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(t => t.id !== action.payload),
      };

    case 'SAVE_AUDIENCE':
      return {
        ...state,
        savedAudiences: [action.payload, ...state.savedAudiences.filter(a => a.id !== action.payload.id)],
      };

    case 'DELETE_AUDIENCE':
      return {
        ...state,
        savedAudiences: state.savedAudiences.filter(a => a.id !== action.payload),
      };

    case 'SAVE_FORM':
      return {
        ...state,
        forms: [action.payload, ...state.forms.filter(f => f.id !== action.payload.id)],
      };

    case 'DELETE_FORM':
      return {
        ...state,
        forms: state.forms.filter(f => f.id !== action.payload),
      };

    case 'ADD_FORM_RESPONSE':
      return {
        ...state,
        formResponses: [...state.formResponses, action.payload],
        forms: state.forms.map(f =>
          f.id === action.payload.formId ? { ...f, responseCount: f.responseCount + 1 } : f
        ),
      };

    case 'SET_ACTIVE_DRAFT':
      return { ...state, activeDraft: action.payload };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

interface NotificationContextValue {
  state: NotificationState;
  dispatch: Dispatch<NotificationAction>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = usePersistedReducer<NotificationState, NotificationAction>(
    'string-quests-notifications',
    notificationReducer,
    INITIAL_NOTIFICATION_STATE
  );

  return (
    <NotificationContext.Provider value={{ state, dispatch }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
