import React from 'react';
import { getNodeTypeName, getNodeTypeColor } from '../constants/storyline';
import type { StoryNode } from '../types/storyline';
import type { GameTime } from '../types/game';

interface StoryNodeCardProps {
  node: StoryNode;
  status: 'available' | 'in_progress' | 'completed' | 'locked';
  isZh: boolean;
  onClick?: () => void;
  actionLabel?: string;
  completedAt?: GameTime;
}

export const StoryNodeCard: React.FC<StoryNodeCardProps> = ({
  node,
  status,
  isZh,
  onClick,
  actionLabel,
  completedAt,
}) => {
  const typeColor = getNodeTypeColor(node.type);
  const typeName = getNodeTypeName(node.type, isZh);

  const statusColors = {
    available: 'border-green-700/50 hover:border-green-500',
    in_progress: 'border-amber-700/50 hover:border-amber-500',
    completed: 'border-gray-700/50 opacity-75',
    locked: 'border-gray-800/50 opacity-50',
  };

  const statusBadgeColors = {
    available: 'bg-green-900/50 text-green-400',
    in_progress: 'bg-amber-900/50 text-amber-400',
    completed: 'bg-gray-700/50 text-gray-400',
    locked: 'bg-gray-800/50 text-gray-500',
  };

  const statusLabels = {
    available: isZh ? '可接取' : 'Available',
    in_progress: isZh ? '进行中' : 'In Progress',
    completed: isZh ? '已完成' : 'Completed',
    locked: isZh ? '未解锁' : 'Locked',
  };

  const getIcon = () => {
    switch (node.icon) {
      case 'gate':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M3 10h18M10 3h4m-2 0v7m-8 4v4m16-4v4M7 21v-8h10v8" />
          </svg>
        );
      case 'scroll':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'task':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'cultivation':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'sword':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3zm0 0l9 9" />
          </svg>
        );
      case 'coin':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'beast':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
        );
      case 'book':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'announcement':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
      case 'victory':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'mystery':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'training':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 bg-gray-800/50 transition-all ${statusColors[status]} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
          >
            {getIcon()}
          </div>
          <div>
            <h4 className="font-medium text-white">
              {isZh ? node.chineseName : node.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
              >
                {typeName}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${statusBadgeColors[status]}`}>
                {statusLabels[status]}
              </span>
            </div>
          </div>
        </div>
        {node.isRequired && (
          <span className="text-xs px-1.5 py-0.5 bg-red-900/50 text-red-400 rounded">
            {isZh ? '必做' : 'Required'}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
        {isZh ? node.chineseDescription : node.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {completedAt ? (
          <span className="text-xs text-gray-500">
            {isZh ? '完成于' : 'Completed'}: {isZh ? '第' : 'Year '}{completedAt.year}{isZh ? '年' : ''} {isZh ? '第' : 'Day '}{completedAt.day}{isZh ? '日' : ''}
          </span>
        ) : (
          <span className="text-xs text-gray-500">
            {node.dialogue?.length
              ? `${node.dialogue.length} ${isZh ? '段对话' : 'dialogues'}`
              : ''}
          </span>
        )}

        {onClick && actionLabel && status !== 'completed' && (
          <button
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
