<template>
  <div :class="[defaultClass, ...getClasses()]">
    <div :class="`${defaultClass}__container`">
      <div :class="`${defaultClass}__search`">
        <input
          type="text"
          :name="inputName"
          :class="`${defaultClass}__input`"
          :disabled="disabled"
          :placeholder="placeholder"
          v-model="inputQuery"
          ref="inputText"
          :autoComplete="autocomplete"
          @input="onInputChange"
          @keydown="onKeyPress"
          @focus="onInputFocus"
          @blur="onInputBlur"
        />
      </div>
      <div
        v-if="inputFocused && suggestionsVisible"
        :class="`${defaultClass}__suggestions`"
      >
        <highlighter
          v-for="(suggestion, index) in suggestions"
          :key="`suggestion_${index}`"
          @mousedown="onSuggestionClick(index)"
          :class="[
            `${defaultClass}__suggestions-item`,
            {
              [`${defaultClass}__suggestions-item_current`]:
                index === suggestionIndex,
            },
          ]"
          :search-words="inputQuery.split(' ')"
          :auto-escape="true"
          :text-to-highlight="suggestion.value"
          :highlight-class-name="highlightClassName"
          :unhighlight-class-name="unhighlightClassName"
          :highlight-tag="highlightTag"
        />
      </div>
    </div>
  </div>
</template>

<script>
import getSuggestions from '@/api/getSuggestions';
import Highlighter from 'vue-highlight-words';

export default {
  props: {
    token: {
      type: String,
      required: true,
    },
    query: {
      type: String,
    },
    placeholder: {
      type: String,
    },
    autoload: {
      type: Boolean,
    },
    count: {
      type: Number,
    },
    autocomplete: {
      type: String,
    },
    url: {
      type: String,
    },
    disabled: {
      type: Boolean,
    },
    fromBound: {
      type: String,
    },
    toBound: {
      type: String,
    },
    inputName: {
      type: String,
    },
    locationOptions: {
      type: Object,
      default: () => ({
        language: 'ru',
        locations: [],
        locationsBoost: [],
      }),
    },
    highlightClassName: {
      type: String,
    },
    unhighlightClassName: {
      type: String,
    },
    highlightTag: {
      type: String,
      default: 'mark',
    },
    defaultClass: {
      type: String,
      default: 'vue-dadata',
    },
    classes: {
      type: String,
      default: '',
    },
  },
  components: {
    'highlighter': Highlighter
  },
  data() {
    return {
      inputQuery: '',
      inputFocused: false,
      suggestions: [],
      suggestionIndex: -1,
      suggestionsVisible: true,
      isValid: false,
    };
  },
  methods: {
    getClasses() {
      return this.classes ? this.classes.split(' ') : [];
    },

    async created() {
      this.inputQuery = this.query ? this.query : '';

      if (this.autoload && this.query) {
        this.suggestions = await this.fetchSuggestions();
      }
    },

    async onInputFocus() {
      this.inputFocused = true;
    },

    async onInputBlur() {
      this.inputFocused = false;
    },

    async onInputChange(event) {
      const value = event.target.value;
      this.inputQuery = value;
      this.suggestionsVisible = true;
      this.suggestions = await this.fetchSuggestions();
    },

    async selectSuggestion(index) {
      if (this.suggestions.length >= index - 1) {
        this.inputQuery = this.suggestions[index].value;
        this.suggestionsVisible = false;
        await this.$nextTick();
        await this.fetchSuggestions();

        if (this.onChange) {
          this.onChange(this.suggestions[index]);
        }
        this.suggestionIndex = -1;
      }
    },

    async onKeyPress(event) {
      const ARROW_DOWN = 40;
      const ARROW_UP = 38;
      const ENTER = 13;

      if (event.which === ARROW_DOWN && this.suggestionsVisible) {
        event.preventDefault();
        if (this.suggestionIndex < this.suggestions.length - 1) {
          this.suggestionIndex = this.suggestionIndex + 1;
          this.inputQuery = this.suggestions[this.suggestionIndex].value;
        }
      } else if (event.which === ARROW_UP && this.suggestionsVisible) {
        event.preventDefault();
        if (this.suggestionIndex >= 0) {
          this.suggestionIndex = this.suggestionIndex - 1;
          this.inputQuery =
            this.suggestionIndex === -1
              ? this.inputQuery
              : this.suggestions[this.suggestionIndex].value;
        }
      } else if (event.which === ENTER) {
        event.preventDefault();
        if (this.suggestionIndex >= 0) {
          this.selectSuggestion(this.suggestionIndex);
        }
      }
    },

    async onSuggestionClick(index) {
      if (this.suggestions.length >= index - 1) {
        this.inputQuery = this.suggestions[index].value;
        this.suggestions = await this.fetchSuggestions();
      }
    },

    async fetchSuggestions() {
      try {
        const request = {
          token: this.token,
          query: this.inputQuery,
          url: this.url,
          toBound: this.toBound,
          fromBound: this.fromBound,
          locationOptions: this.locationOptions,
        };

        const suggestions = await getSuggestions(request);

        return suggestions;
      } catch (error) {
        this.$emit('handleError', error);
        return [];
      }
    },

    setInputQuery(value) {
      this.inputQuery = value ? value : '';
    },
  },
};
</script>

<style lang="scss">
.vue-dadata {
  &__container {
    width: 100%;
    position: relative;
  }

  &__input {
    font-size: 14px;
    width: 100%;
    height: 47px;
    outline: none;
    border-radius: 4px;
    border: 1px solid #f1c40f;
    transition: 0.3s;
    box-sizing: border-box;
    padding: 0 5px;

    &:focus {
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
        0 0 0 3px rgba(255, 154, 0, 0.1);
      border-color: #ff931e;
    }
  }

  &__suggestions {
    position: absolute;
    z-index: 10;
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;

    &-item {
      padding: 10px;
      cursor: pointer;
      transition: 0.3s;

      &-highlight {
        background-color: #ffdfbd;
      }

      &:hover {
        background-color: #ffdfbd;
      }

      &_current {
        background-color: #fff5e7;
      }
    }
  }
}
</style>
