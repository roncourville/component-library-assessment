"use client"

import * as React from "react"
import { ChevronDown, ChevronUp, Github, Layers } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

export function ProjectHeader() {
    const [isExpanded, setIsExpanded] = React.useState(false)

    return (
        <Card className="mb-6 overflow-hidden">
            <CardContent className="p-6">
                <div
                    className={`space-y-4 ${!isExpanded ? "max-h-[180px]" : "max-h-[1000px]"} transition-all duration-500 ease-in-out overflow-hidden`}
                >
                    <div>
                        <h1 className="text-2xl font-semibold mb-2">Ron Courville Component Library Technical Assessment</h1>
                        <p className="text-muted-foreground">
                            Built with React, TypeScript, shadcn, Turborepo, Next.JS, PostgreSQL, and Supabase, this component
                            library provides a pluggable data grid with customizable cell renderers, and an API-driven multi-user selection component.
                            The architecture prioritizes scalability and modularity for extensible front-ends.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <a
                            href="https://github.com/roncourville/component-library-assessment"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm gap-2 text-[#0d0d0d] opacity-65 hover:opacity-100 transition-opacity"
                        >
                            <img height="24" width="24" src="https://cdn.simpleicons.org/github/0d0d0d" />
                            GitHub Repository
                        </a>
                        <a
                            href="https://component-library-assessment-storybook.vercel.app/?path=/story/ui-datagrid--default"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm gap-2 text-[#0d0d0d] opacity-65 hover:opacity-100 transition-opacity"
                        >
                            <img height="18" width="24" src="https://cdn.simpleicons.org/storybook/0d0d0d" />
                            Storybook Documentation
                        </a>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Key Features</h2>
                        <div className="grid gap-4">
                            <div>
                                <h3 className="font-medium mb-2">Pluggable Data Grid</h3>
                                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                                    <li>Schema defined via a JavaScript object.</li>
                                    <li>Custom cell View and Edit components registration.</li>
                                    <li>Efficient handling of large data sets with server side rendering.</li>
                                    <li>Seamless page navigation with adjacent page pre-caching and rehydration.</li>
                                    <li>Edit modes supported at row and single cell scoped operations.</li>
                                    <li>Higly customizable feature set options.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">Multi-User Selection Component</h3>
                                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                                    <li>Demonstrates addon component to pluggable data grid.</li>
                                    <li>Multi-select with avatars.</li>
                                    <li>Overflow handling (+1 indicator).</li>
                                    <li>Autocomplete search API integration.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">System Design</h3>
                                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                                    <li>Turborepo monorepo structure for sharing dependecies across projects.</li>
                                    <li>PostgreSQL database persists state with CRUD operations to Supabase.</li>
                                    <li>Demo app made with NextJS implements server side actions.</li>
                                    <li>Storybook component documentation.</li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Show Less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Show More
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}

