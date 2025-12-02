
'use client';
import { useMemo, useRef } from 'react';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAt,
  startAfter,
  endAt,
  endBefore,
  QueryConstraint,
  DocumentReference,
  CollectionReference,
  Query,
} from 'firebase/firestore';

// A custom hook to memoize Firestore queries and references.
// This is crucial to prevent infinite loops in React components
// when using hooks like `useCollection` or `useDoc`.
export function useMemoFirebase<T>(
  factory: () => T,
  deps: any[]
): T {
  const memoizedRef = useRef<T | null>(null);
  const prevDeps = useRef<any[]>([]);

  if (
    !memoizedRef.current ||
    deps.length !== prevDeps.current.length ||
    deps.some((dep, i) => dep !== prevDeps.current[i])
  ) {
    const newRef = factory();

    if (
      newRef && (
      isEqual(newRef, memoizedRef.current)
    )) {
      // It's the same query/ref, no need to update
    } else {
      memoizedRef.current = newRef;
    }
    prevDeps.current = deps;
  }

  if (memoizedRef.current === null && deps.some(dep => dep === undefined || dep === null)) {
      // If any dependency is not ready, return null.
      return null as T;
  }
  
  if (memoizedRef.current === null) {
      memoizedRef.current = factory();
  }
  
  if (memoizedRef.current === undefined) {
      throw new Error(
          `${memoizedRef.current} was not properly memoized using useMemoFirebase`
        );
  }

  return memoizedRef.current;
}

// Basic equality check for Firestore refs/queries.
function isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    
    // For DocumentReference and CollectionReference
    if ('path' in a && 'path' in b) {
        return a.path === b.path;
    }

    // For Query
    if (a.type === 'query' && b.type === 'query') {
        return a._query.path.canonicalString() === b._query.path.canonicalString() &&
               JSON.stringify(a._query.explicitOrderBy) === JSON.stringify(b._query.explicitOrderBy) &&
               JSON.stringify(a._query.filters) === JSON.stringify(b._query.filters) &&
               a._query.limit === b._query.limit;
    }
    
    return false;
}
