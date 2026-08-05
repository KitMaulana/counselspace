@props([
    'label' => null,
])

<div class="cs-card-tech-wrap">
    <button type="button" {{ $attributes->merge(['class' => 'cs-card-tech']) }}>
        {{ $label ?? $slot }}
    </button>
</div>
