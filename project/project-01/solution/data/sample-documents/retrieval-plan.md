# Retrieval Plan

## Overview

This document outlines the strategy for implementing text retrieval in the knowledge base application.

## Chunking Approach

Documents are split into chunks using a paragraph-aware algorithm:
- Split on double newlines (paragraph boundaries)
- Merge short paragraphs until chunk reaches ~500 characters
- Each chunk gets a unique ID, document reference, and metadata

## Keyword Matching

The retrieval system uses keyword-based matching and returns top 2 most relevant chunks as citations.

## Confidence Scoring

- 0.85 when citations are found
- 0.30 when no citations are available
