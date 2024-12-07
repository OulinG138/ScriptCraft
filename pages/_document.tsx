import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var mode = localStorage.getItem('darkMode');
                    if (mode === 'true') {
                      document.body.style.backgroundColor = '#1a1a1a';
                      document.body.style.color = '#ffffff';
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
