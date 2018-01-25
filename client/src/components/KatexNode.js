import React, { Component } from 'react'
import KaTeX from 'katex';

/**
 * React component to render maths using katex
 */
class KatexNode extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
  }

  render() {
    try {
      const html = KaTeX.renderToString(this.props.tex, {displayMode: !this.props.inline});
      return <span dangerouslySetInnerHTML={{__html: html}} />
    } catch (error) {
      return <span style={{ color: 'red' }}>{this.props.inline}</span>
    }
  }
}

export default KatexNode
