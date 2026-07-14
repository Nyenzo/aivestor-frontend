

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

// USERS COLLECTION

export async function getUserProfile(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function setUserProfile(userId, data) {
  try {
    const userRef = doc(db, 'users', userId);
    const userData = {
      ...data,
      updatedAt: serverTimestamp()
    };

    // Add createdAt only for new documents
    const exists = (await getDoc(userRef)).exists();
    if (!exists) {
      userData.createdAt = serverTimestamp();
    }

    await setDoc(userRef, userData, { merge: true });
    return { id: userId, ...userData };
  } catch (error) {
    console.error('Error setting user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId, updates) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export function subscribeToUserProfile(userId, callback, errorCallback) {
  const userRef = doc(db, 'users', userId);

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error in user profile listener:', error);
      if (errorCallback) errorCallback(error);
    }
  );
}

// PORTFOLIOS COLLECTION

export async function getUserPortfolio(userId) {
  try {
    const portfolioRef = doc(db, 'portfolios', userId);
    const portfolioSnap = await getDoc(portfolioRef);

    if (portfolioSnap.exists()) {
      return { id: portfolioSnap.id, ...portfolioSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting portfolio:', error);
    throw error;
  }
}

export async function setUserPortfolio(userId, portfolioData) {
  try {
    const portfolioRef = doc(db, 'portfolios', userId);
    const data = {
      ...portfolioData,
      userId,
      updatedAt: serverTimestamp()
    };

    const exists = (await getDoc(portfolioRef)).exists();
    if (!exists) {
      data.createdAt = serverTimestamp();
    }

    await setDoc(portfolioRef, data, { merge: true });
    return { id: userId, ...data };
  } catch (error) {
    console.error('Error setting portfolio:', error);
    throw error;
  }
}

export async function addPosition(userId, position) {
  try {
    const portfolioRef = doc(db, 'portfolios', userId);
    await updateDoc(portfolioRef, {
      positions: arrayUnion(position),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error adding position:', error);
    throw error;
  }
}

export async function removePosition(userId, symbolToRemove) {
  try {
    const portfolio = await getUserPortfolio(userId);
    if (!portfolio || !portfolio.positions) return false;

    const updatedPositions = portfolio.positions.filter(
      pos => pos.stock_symbol !== symbolToRemove
    );

    const portfolioRef = doc(db, 'portfolios', userId);
    await updateDoc(portfolioRef, {
      positions: updatedPositions,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error removing position:', error);
    throw error;
  }
}

export async function updatePosition(userId, symbol, updates) {
  try {
    const portfolio = await getUserPortfolio(userId);
    if (!portfolio || !portfolio.positions) return false;

    const updatedPositions = portfolio.positions.map(pos =>
      pos.stock_symbol === symbol ? { ...pos, ...updates } : pos
    );

    const portfolioRef = doc(db, 'portfolios', userId);
    await updateDoc(portfolioRef, {
      positions: updatedPositions,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating position:', error);
    throw error;
  }
}

export function subscribeToPortfolio(userId, callback, errorCallback) {
  const portfolioRef = doc(db, 'portfolios', userId);

  return onSnapshot(
    portfolioRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error in portfolio listener:', error);
      if (errorCallback) errorCallback(error);
    }
  );
}

// TRANSACTIONS COLLECTION

export async function addTransaction(userId, transaction) {
  try {
    const transactionsRef = collection(db, 'transactions');
    const transactionDoc = doc(transactionsRef);

    const data = {
      ...transaction,
      userId,
      createdAt: serverTimestamp(),
      timestamp: Timestamp.now()
    };

    await setDoc(transactionDoc, data);
    return { id: transactionDoc.id, ...data };
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
}

export async function getUserTransactions(userId, limitCount = 50) {
  try {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
}

export async function getStockTransactions(userId, symbol, limitCount = 20) {
  try {
    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      where('symbol', '==', symbol),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting stock transactions:', error);
    throw error;
  }
}

export function subscribeToTransactions(userId, callback, errorCallback, limitCount = 50) {
  const transactionsRef = collection(db, 'transactions');
  const q = query(
    transactionsRef,
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(transactions);
    },
    (error) => {
      console.error('Error in transactions listener:', error);
      if (errorCallback) errorCallback(error);
    }
  );
}

// WATCHLISTS COLLECTION

export async function getUserWatchlist(userId) {
  try {
    const watchlistRef = doc(db, 'watchlists', userId);
    const watchlistSnap = await getDoc(watchlistRef);

    if (watchlistSnap.exists()) {
      return { id: watchlistSnap.id, ...watchlistSnap.data() };
    }
    return { stocks: [] };
  } catch (error) {
    console.error('Error getting watchlist:', error);
    throw error;
  }
}

export async function addToWatchlist(userId, stockData) {
  try {
    const watchlistRef = doc(db, 'watchlists', userId);

    const exists = (await getDoc(watchlistRef)).exists();
    if (!exists) {
      await setDoc(watchlistRef, {
        userId,
        stocks: [stockData],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(watchlistRef, {
        stocks: arrayUnion(stockData),
        updatedAt: serverTimestamp()
      });
    }
    return true;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
}

export async function removeFromWatchlist(userId, symbol) {
  try {
    const watchlist = await getUserWatchlist(userId);
    if (!watchlist || !watchlist.stocks) return false;

    const updatedStocks = watchlist.stocks.filter(stock => stock.symbol !== symbol);

    const watchlistRef = doc(db, 'watchlists', userId);
    await updateDoc(watchlistRef, {
      stocks: updatedStocks,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
}

export function subscribeToWatchlist(userId, callback, errorCallback) {
  const watchlistRef = doc(db, 'watchlists', userId);

  return onSnapshot(
    watchlistRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      } else {
        callback({ stocks: [] });
      }
    },
    (error) => {
      console.error('Error in watchlist listener:', error);
      if (errorCallback) errorCallback(error);
    }
  );
}

// PREFERENCES COLLECTION

export async function getUserPreferences(userId) {
  try {
    const prefsRef = doc(db, 'preferences', userId);
    const prefsSnap = await getDoc(prefsRef);

    if (prefsSnap.exists()) {
      return { id: prefsSnap.id, ...prefsSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting preferences:', error);
    throw error;
  }
}

export async function setUserPreferences(userId, preferences) {
  try {
    const prefsRef = doc(db, 'preferences', userId);
    const data = {
      ...preferences,
      userId,
      updatedAt: serverTimestamp()
    };

    const exists = (await getDoc(prefsRef)).exists();
    if (!exists) {
      data.createdAt = serverTimestamp();
    }

    await setDoc(prefsRef, data, { merge: true });
    return { id: userId, ...data };
  } catch (error) {
    console.error('Error setting preferences:', error);
    throw error;
  }
}

export function subscribeToPreferences(userId, callback, errorCallback) {
  const prefsRef = doc(db, 'preferences', userId);

  return onSnapshot(
    prefsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error in preferences listener:', error);
      if (errorCallback) errorCallback(error);
    }
  );
}

// CHAT HISTORY COLLECTION

export async function addChatMessage(userId, message) {
  try {
    const messagesRef = collection(db, 'chatHistory');
    const messageDoc = doc(messagesRef);

    const data = {
      ...message,
      userId,
      timestamp: serverTimestamp()
    };

    await setDoc(messageDoc, data);
    return { id: messageDoc.id, ...data };
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw error;
  }
}

export async function getChatHistory(userId, limitCount = 100) {
  try {
    const messagesRef = collection(db, 'chatHistory');
    const q = query(
      messagesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
}

export async function clearChatHistory(userId) {
  try {
    const messagesRef = collection(db, 'chatHistory');
    const q = query(messagesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
}

export function subscribeToChatHistory(userId, callback, errorCallback, limitCount = 100) {
  const messagesRef = collection(db, 'chatHistory');
  const q = query(
    messagesRef,
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
      callback(messages);
    },
    (error) => {
      console.error('Error in chat history listener:', error);
      if (errorCallback) errorCallback(error);
    }
  );
}

// BATCH OPERATIONS

export async function batchUpdateDocuments(updates) {
  try {
    const batch = writeBatch(db);

    updates.forEach(({ collection: collName, docId, data }) => {
      const docRef = doc(db, collName, docId);
      batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error in batch update:', error);
    throw error;
  }
}

export async function deleteUserData(userId) {
  try {
    const batch = writeBatch(db);

    // Delete user document
    batch.delete(doc(db, 'users', userId));

    // Delete portfolio
    batch.delete(doc(db, 'portfolios', userId));

    // Delete preferences
    batch.delete(doc(db, 'preferences', userId));

    // Delete watchlist
    batch.delete(doc(db, 'watchlists', userId));

    await batch.commit();

    // Delete transactions (separate batch due to query requirement)
    const transactionsRef = collection(db, 'transactions');
    const transQuery = query(transactionsRef, where('userId', '==', userId));
    const transSnapshot = await getDocs(transQuery);

    if (!transSnapshot.empty) {
      const transBatch = writeBatch(db);
      transSnapshot.docs.forEach((doc) => {
        transBatch.delete(doc.ref);
      });
      await transBatch.commit();
    }

    // Delete chat history (separate batch)
    const chatRef = collection(db, 'chatHistory');
    const chatQuery = query(chatRef, where('userId', '==', userId));
    const chatSnapshot = await getDocs(chatQuery);

    if (!chatSnapshot.empty) {
      const chatBatch = writeBatch(db);
      chatSnapshot.docs.forEach((doc) => {
        chatBatch.delete(doc.ref);
      });
      await chatBatch.commit();
    }

    return true;
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}

// BROKERAGE CONNECTIONS COLLECTION

export async function getBrokerageStatus(userId) {
  try {
    const connectionsRef = collection(db, 'brokerageConnections');
    const q = query(connectionsRef, where('user_id', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting brokerage status:', error);
    throw error;
  }
}

export function subscribeToBrokerage(userId, callback, errorCallback) {
  const connectionsRef = collection(db, 'brokerageConnections');
  const q = query(connectionsRef, where('user_id', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const connections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(connections);
    },
    (error) => {
      console.error('Error in brokerage listener:', error);
      if (errorCallback) errorCallback(error);
    }
  );
}

export default {
  // Users
  getUserProfile,
  setUserProfile,
  updateUserProfile,
  subscribeToUserProfile,

  // Portfolios
  getUserPortfolio,
  setUserPortfolio,
  addPosition,
  removePosition,
  updatePosition,
  subscribeToPortfolio,

  // Transactions
  addTransaction,
  getUserTransactions,
  getStockTransactions,
  subscribeToTransactions,

  // Watchlists
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  subscribeToWatchlist,

  // Preferences
  getUserPreferences,
  setUserPreferences,
  subscribeToPreferences,

  // Chat
  addChatMessage,
  getChatHistory,
  clearChatHistory,
  subscribeToChatHistory,

  // Brokerage
  getBrokerageStatus,
  subscribeToBrokerage,

  // Batch operations
  batchUpdateDocuments,
  deleteUserData
};

