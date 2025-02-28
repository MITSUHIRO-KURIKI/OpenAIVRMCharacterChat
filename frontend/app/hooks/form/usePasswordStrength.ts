'use client';

// react
import { useState, useEffect } from 'react';
// lib
import { zxcvbn } from '@zxcvbn-ts/core';
import { ZodType } from 'zod';
import { getZxcvbnStrengthLabel } from '@/app/components/lib/zxcvbn-ts';


// type
type UsePasswordStrengthProps = {
  passwordValue:     string;
  passwordZodSchema: ZodType<string>;
};

// usePasswordStrength
// - 入力されているパスワードの強度確認のカスタムフック
export function usePasswordStrength({ passwordValue, passwordZodSchema }: UsePasswordStrengthProps) {
  
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    if (!passwordValue) {
      setScore(0);
      return;
    };
    // zxcvbnでスコア計算
    const zxcvbnResult  = zxcvbn(passwordValue);
    let calculatedScore = zxcvbnResult.score;

    // zod 必須条件を満たしていない場合、scoreを2までに抑える
    if (!passwordZodSchema.safeParse(passwordValue).success && calculatedScore > 2) {
      calculatedScore = 2;
    };
    setScore(calculatedScore);
  }, [passwordValue, passwordZodSchema]);

  const strengthLabel = getZxcvbnStrengthLabel(score);

  return { score, strengthLabel };
};