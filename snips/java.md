# Java


+### Log to a file

+For example, if you can't see stdout

```
try {
	String str = "Hello";
	BufferedWriter writer = new BufferedWriter(new FileWriter("/tmp/registry.log"));
	writer.write(str);
	writer.close();
} catch (Exception e) {}
```



### Decode unicode escape characters from a string
For example, when parsing JSON from a web page
```java
public class Main {

  private static String decodeUnicodeEscapeChars(String fromStr) {
    String decodedStr = "";
    String buffer = "";
    for (int i = 0, n = fromStr.length(); i < n; ++i) {
      final char c = fromStr.charAt(i);
      final int bufLen = buffer.length();
      if (c == '\\') {
        // Unicode start detected, drain buffer and start a new one
        decodedStr += buffer;
        buffer = "\\";
        continue;
      }
      if (bufLen == 1 && c == 'u') {
        // Unicode start continued, add to buffer
        buffer += c;
        continue;
      }
      if ((bufLen >= 2
          && (Character.isDigit(c) || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')))) {
        // Unicode value detected, add to buffer
        buffer += c;
        if (bufLen == 5) {
          // We have a full unicode value, append and reset buffer
          decodedStr += (char) Integer.parseInt(buffer.substring(2), 16);
          buffer = "";
        }
        continue;
      }
      if (bufLen != 0) {
        // Failed to finish a full unicode char, drain buffer
        decodedStr += buffer;
        buffer = "";
      }
      // Append normal characters
      decodedStr += c;
    }
    return decodedStr + buffer;
  }

  public static void main(String[] args) {
    System.out.println(
        decodeUnicodeEscapeChars(
            "{\\u0022message\\u0022:\\u0022yo. how u doin? its 98\\u00b0 here\\u0022}"));
    System.out.println(decodeUnicodeEscapeChars("abc\\u00C0"));
    System.out.println(decodeUnicodeEscapeChars("abc\\u002wef"));
    System.out.println(decodeUnicodeEscapeChars("abc\\u000\\u00d0"));
    System.out.println(decodeUnicodeEscapeChars("abc\\u000"));
    System.out.println(decodeUnicodeEscapeChars("\\u0000123"));
  }

}
```


