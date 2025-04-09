#project-overview (프로젝트 개요)
서버에서 영화정보, 장르정보, 감독정보, 유저정보를 불러오는 리엑트 프로젝트이다.
영화정보에는 장르, 감독, 유저정보와 함께 mp4 영상을 불러와 재생할 수 있다.

#feature-requirements (기능 요구사항)

1. 다음 의존성을 사용하고 있다. 패키지 관리자는 pnpm을 사용한다.
"dependencies": {
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^13.5.0",
    "@types/jest": "^27.5.2",
    "@types/node": "^16.18.126",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.1",
    "@types/react-router-dom": "^5.3.3",
    "jwt-decode": "^4.0.0",
    "ky": "^1.2.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.5.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5",
    "web-vitals": "^2.1.4"
  },

2. 로그인, 회원가입 요청은 basic token 요청이다. 나머지 요청은 bearer token 요청이다.
basic token 요청은 header.authorization에 입력값들을 base64방식으로 인코딩한다.

3. 프로젝트의 포트번호는 3010이다.

4. 서버 요청은 ky를 이용한다. 의존성을 추가해라

5. html, css를 신경써서 관리해라
테일윈드를 사용해라
다크모드를 적용해라
디자인은 넷플릭스 사이트를 참고하면 좋다.

#rules (규칙)
- 모든 새로운 컴포넌트는 특별히 명시되지 않는 한 /components에 생성되어야 하며 example-component.tsx와 같이 이름 지어져야 합니다.
- 모든 새로운 페이지는 /app에 생성되어야 하며 example-page.tsx와 같이 이름 지어져야 합니다.
- 코드의 추가, 수정을 요청할 때 html, css 디자인의 변경 요청이 없다면 이를 변경하지 않는다.
- 코드의 추가, 수정을 요청할 때 요청하지 않은 기능의 변경이 불가피하면 한번 물어보고 변경해라
- 기능 추가, 변경시 readme에 관련사항을 추가 또는 변경을 해라