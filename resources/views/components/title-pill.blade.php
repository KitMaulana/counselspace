@props([
    'tag' => 'h2',
    'size' => null,
])

@php
    $classes = 'cs-title-pill' . ($size === 'sm' ? ' cs-title-pill--sm' : '');
@endphp

<{{ $tag }} {{ $attributes->merge(['class' => $classes]) }}>{{ $slot }}</{{ $tag }}>
