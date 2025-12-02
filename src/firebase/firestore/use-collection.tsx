
'use client';

import { useEffect, useState, useRef } from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  getDocs,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { useMemoFirebase } from '../hooks/use-memo-firebase';
import { FirestorePermissionError } from '../errors';
import { errorEmitter } from '../error-emitter';

interface UseCollectionOptions<T> {
  dependencies?: any[];
  onData?: (data: T[]) => void;
}

// Overload for CollectionReference
export function useCollection<T>(
  ref: CollectionReference<T> | null,
  options?: UseCollectionOptions<T>
): { data: T[]; isLoading: boolean; error: FirestoreError | null };

// Overload for Query
export function useCollection<T>(
  query: Query<T> | null,
  options?: UseCollectionOptions<T>
): { data: T[]; isLoading: boolean; error: FirestoreError | null };

export function useCollection<T>(
  refOrQuery: CollectionReference<T> | Query<T> | null,
  options: UseCollectionOptions<T> = {}
) {
  const { dependencies = [], onData } = options;
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const memoizedTargetRefOrQuery = useMemoFirebase(
    () => refOrQuery,
    dependencies
  );

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as unknown as T)
        );
        setData(docs);
        if (onData) {
          onData(docs);
        }
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        const path =
          memoizedTargetRefOrQuery instanceof CollectionReference
            ? memoizedTargetRefOrQuery.path
            : (memoizedTargetRefOrQuery as unknown as Query)._query.path.canonicalString()

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        })
        errorEmitter.emit('permission-error', contextualError);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}
