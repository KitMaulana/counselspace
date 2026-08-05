@props([
    'variant' => null,   // null (glossy) | ghost | chevron
    'size' => null,      // null | sm | lg
    'shape' => null,     // null | pill
    'block' => false,
    'type' => 'button',
    'href' => null,
])

@php
    $classes = collect([
        'cs-btn',
        $variant ? 'cs-btn--' . $variant : null,
        $size ? 'cs-btn--' . $size : null,
        $shape ? 'cs-btn--' . $shape : null,
        $block ? 'cs-btn--block' : null,
    ])->filter()->implode(' ');
@endphp

@if ($href)
    <a href="{{ $href }}" {{ $attributes->merge(['class' => $classes]) }}>{{ $slot }}</a>
@else
    <button type="{{ $type }}" {{ $attributes->merge(['class' => $classes]) }}>{{ $slot }}</button>
@endif
