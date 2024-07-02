import surcase from 'sucrase'

// `surcase` `RawSourceMap` type doesn't allow `null` in `sourcesContent` ¯\_(ツ)_/¯
export type SourceMap = {
  version: number
  file: string
  sources: string[]
  sourceRoot?: string
  sourcesContent?: (string | null)[]
  mappings: string
  names: string[]
}

const inlineSourceMapFiles = (sourceMap: SourceMap, files: Record<string, string>): SourceMap => ({
  ...sourceMap,
  sourcesContent: sourceMap.sources.map((source, i) => {
    if (Object.prototype.hasOwnProperty.call(files, source)) {
      return files[source]
    }

    return sourceMap.sourcesContent?.[i] ?? null
  }),
})

const toInlineSourceMapComment = (sourceMap: SourceMap) =>
  `//# sourceMappingURL=data:application/json,${btoa(JSON.stringify(sourceMap))}`

export type TransformOptions = {
  transforms: surcase.Transform[]
  inlineSourceMap?: {
    sourcePath: string
    compiledPath: string
  }
}

export const transform = (code: string, {transforms, inlineSourceMap}: TransformOptions) => {
  code = code.replace(/\r?\n/g, '\n')

  const result = surcase.transform(code, {
    transforms,
    ...(inlineSourceMap
      ? {
          filePath: inlineSourceMap.sourcePath,
          sourceMapOptions: {
            compiledFilename: inlineSourceMap.compiledPath,
          },
        }
      : {}),
  })

  if (inlineSourceMap && result.sourceMap) {
    const sourceMap = inlineSourceMapFiles(result.sourceMap, {[inlineSourceMap.sourcePath]: code})
    const sourceMapString = toInlineSourceMapComment(sourceMap)
    return `${result.code}\n${sourceMapString}`
  }

  return result.code
}
