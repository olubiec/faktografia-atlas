import tokens from '../../../config/tokens.json';

export type MeasureFn = (text: string, size: number, weight?: number | string) => number;

export type FitTextOptions = {
  maxWidth: number;
  maxLines: number;
  fontSize: number;
  fontWeight?: number | string;
  measure: MeasureFn;
  canvasWidth?: number;
  minFontSize?: number;
  lineHeightRatio?: number;
};

export type FitTextResult = {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  totalHeight: number;
};

const BASE_FONT_SCALE = Object.values(tokens.font.scale).sort((a, b) => a - b); // [13, 17, 20, 25, 31, 39, 49, 61, 76]

function getFontSteps(scaleFactor: number): number[] {
  return BASE_FONT_SCALE.map((s) => Math.round(s * scaleFactor));
}

function tokenize(text: string): string[] {
  // Tokenize by space or hyphen (keeping hyphen attached to preceding word)
  // E.g. "Powiat kędzierzyńsko-kozielski" -> ["Powiat", "kędzierzyńsko-", "kozielski"]
  const rawTokens = text.trim().split(/(\s+)/);
  const result: string[] = [];

  for (const tok of rawTokens) {
    if (!tok || /^\s+$/.test(tok)) continue;
    if (tok.includes('-')) {
      const parts = tok.split('-');
      for (let i = 0; i < parts.length; i++) {
        if (i < parts.length - 1) {
          result.push(parts[i] + '-');
        } else if (parts[i]) {
          result.push(parts[i]);
        }
      }
    } else {
      result.push(tok);
    }
  }

  return result;
}

function wrapText(
  tokensList: string[],
  size: number,
  weight: number | string | undefined,
  maxWidth: number,
  measure: MeasureFn
): string[] {
  if (tokensList.length === 0) return [];

  const lines: string[] = [];
  let currentLine = '';

  for (const token of tokensList) {
    if (!currentLine) {
      currentLine = token;
      continue;
    }

    const separator = currentLine.endsWith('-') ? '' : ' ';
    const testLine = currentLine + separator + token;
    const width = measure(testLine, size, weight);

    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = token;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export function fitText(text: string, options: FitTextOptions): FitTextResult {
  const {
    maxWidth,
    maxLines,
    fontSize: startingFontSize,
    fontWeight,
    measure,
    canvasWidth = 1080,
    lineHeightRatio = 1.2,
  } = options;

  const scaleFactor = canvasWidth / 1080;
  const steps = getFontSteps(scaleFactor);
  const minFontSize = options.minFontSize ?? Math.round(tokens.font.scale.sm * scaleFactor); // 17 at 1080px

  const tokensList = tokenize(text);

  // Find candidate font sizes starting from startingFontSize down to minFontSize
  let currentSize = startingFontSize;
  let lines: string[] = [];

  while (currentSize >= minFontSize) {
    lines = wrapText(tokensList, currentSize, fontWeight, maxWidth, measure);

    // Check if lines fit maxLines and no single line exceeds maxWidth
    const allLinesFitWidth = lines.every((l) => measure(l, currentSize, fontWeight) <= maxWidth);

    if (lines.length <= maxLines && allLinesFitWidth) {
      const lineHeight = Math.round(currentSize * lineHeightRatio);
      return {
        lines,
        fontSize: currentSize,
        lineHeight,
        totalHeight: lines.length * lineHeight,
      };
    }

    // Step down to next smaller size in steps
    const nextSmallerStep = [...steps].reverse().find((s) => s < currentSize);
    if (nextSmallerStep === undefined || nextSmallerStep < minFontSize) {
      if (currentSize === minFontSize) {
        break;
      }
      currentSize = minFontSize;
    } else {
      currentSize = nextSmallerStep;
    }
  }

  // If still doesn't fit at minFontSize, enforce maxLines and truncate the last line with "…"
  lines = wrapText(tokensList, minFontSize, fontWeight, maxWidth, measure);

  if (lines.length > maxLines) {
    const keptLines = lines.slice(0, maxLines - 1);
    // Combine all remaining text for the last line
    const remainingTokens = tokensList.slice(
      tokensList.indexOf(lines[maxLines - 1].split(/[\s-]/)[0])
    );
    let lastLineText = remainingTokens.join(' ').replace(/-\s+/g, '-');

    // Truncate last line until `lastLineText + '…'` fits in maxWidth
    while (lastLineText.length > 0 && measure(lastLineText + '…', minFontSize, fontWeight) > maxWidth) {
      lastLineText = lastLineText.slice(0, -1).trim();
    }
    keptLines.push(lastLineText + '…');
    lines = keptLines;
  } else {
    // If lines <= maxLines but some line exceeds maxWidth at minFontSize
    lines = lines.map((line) => {
      if (measure(line, minFontSize, fontWeight) <= maxWidth) return line;
      let truncated = line;
      while (truncated.length > 0 && measure(truncated + '…', minFontSize, fontWeight) > maxWidth) {
        truncated = truncated.slice(0, -1).trim();
      }
      return truncated + '…';
    });
  }

  const lineHeight = Math.round(minFontSize * lineHeightRatio);
  return {
    lines,
    fontSize: minFontSize,
    lineHeight,
    totalHeight: lines.length * lineHeight,
  };
}
