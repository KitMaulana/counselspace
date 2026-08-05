@props([
    'size' => null,    // null | lg | xl
    'src' => null,
    'alt' => '',
])

@php
    $classes = 'cs-avatar' . ($size ? ' cs-avatar--' . $size : '');
@endphp

<div {{ $attributes->merge(['class' => $classes]) }}>
    @if ($src)
        <img src="{{ $src }}" alt="{{ $alt }}">
    @else
        {{ $slot }}
    @endif
</div>
