// Types for module route builders

export default interface ViewBuilder {
    (node: DocumentFragment, pathParams: Record<string, string>, urlSearchParams: URLSearchParams): Promise<void>
}

export interface ViewBuilderModule {
    setup: ViewBuilder
}