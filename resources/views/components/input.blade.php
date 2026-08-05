@props([
    'label' => null,
    'id' => null,
    'type' => 'text',
    'placeholder' => null,
    'required' => false,
])

<div class="form-group">
    @if ($label)
        <label class="form-label" @if ($id) for="{{ $id }}" @endif>{{ $label }}</label>
    @endif
    <input
        type="{{ $type }}"
        @if ($id) id="{{ $id }}" @endif
        placeholder="{{ $placeholder }}"
        @if ($required) required @endif
        {{ $attributes->merge(['class' => 'form-input']) }}
    >
</div>
