declare module 'chess.js' {
  export interface Move {
    color: string
    from: string
    to: string
    piece: string
    captured?: string
    promotion?: string
    flags: string
    san: string
    lan: string
    before: string
    after: string
  }

  export interface ChessInstance {
    move(move: string | { from: string; to: string; promotion?: string }, options?: any): Move | null
    moves(options?: { verbose?: boolean }): string[]
    moves(options: { verbose: true }): Move[]
    moves(options?: { verbose?: boolean }): string[] | Move[]
    in_checkmate(): boolean
    in_draw(): boolean
    in_check(): boolean
    in_stalemate(): boolean
    in_threefold_repetition(): boolean
    insufficient_material(): boolean
    game_over(): boolean
    fen(): string
    pgn(options?: any): string
    load_pgn(pgn: string, options?: any): boolean
    reset(): void
    turn(): string
    history(options?: any): string[] | Move[]
    get_comments(): any
    delete_comment(moveNumber: number): any
    add_comment(comment: string, moveNumber?: number): void
    put(piece: { type: string; color: string }, square: string): boolean
    get(square: string): { type: string; color: string } | null
    remove(square: string): { type: string; color: string } | null
    clear(): void
    perft(depth: number): number
    square_color(square: string): string
    validate_fen(fen: string): { valid: boolean; error_number: number; error: string }
    load(fen: string): boolean
    ascii(): string
  }

  export class Chess {
    constructor(fen?: string)
    move(move: string | { from: string; to: string; promotion?: string }, options?: any): Move | null
    moves(options?: { verbose?: boolean }): string[]
    moves(options: { verbose: true }): Move[]
    moves(options?: { verbose?: boolean }): string[] | Move[]
    in_checkmate(): boolean
    in_draw(): boolean
    in_check(): boolean
    in_stalemate(): boolean
    in_threefold_repetition(): boolean
    insufficient_material(): boolean
    game_over(): boolean
    fen(): string
    pgn(options?: any): string
    load_pgn(pgn: string, options?: any): boolean
    reset(): void
    turn(): string
    history(options?: any): string[] | Move[]
    get_comments(): any
    delete_comment(moveNumber: number): any
    add_comment(comment: string, moveNumber?: number): void
    put(piece: { type: string; color: string }, square: string): boolean
    get(square: string): { type: string; color: string } | null
    remove(square: string): { type: string; color: string } | null
    clear(): void
    perft(depth: number): number
    square_color(square: string): string
    validate_fen(fen: string): { valid: boolean; error_number: number; error: string }
    load(fen: string): boolean
    ascii(): string
  }

  // Default export
  declare const ChessConstructor: typeof Chess
  export default ChessConstructor
}
