import { EventEmitter } from 'events';

class BookmarkEventService extends EventEmitter {
  emitBookmarkRemoved(recipeId: number) {
    this.emit('bookmarkRemoved', recipeId);
  }

  emitBookmarkAdded(recipeId: number) {
    this.emit('bookmarkAdded', recipeId);
  }

  onBookmarkChanged(callback: (recipeId: number, action: 'added' | 'removed') => void) {
    this.on('bookmarkRemoved', (recipeId) => callback(recipeId, 'removed'));
    this.on('bookmarkAdded', (recipeId) => callback(recipeId, 'added'));
  }

  removeBookmarkListeners() {
    this.removeAllListeners('bookmarkRemoved');
    this.removeAllListeners('bookmarkAdded');
  }
}

export const bookmarkEventService = new BookmarkEventService();