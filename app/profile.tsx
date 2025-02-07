import { GetServerSideProps } from 'next';

interface ProfileProps {
    userName: string | null;
  }
  
  const Profile: React.FC<ProfileProps> = ({ userName }) => {
    return (
      <div>
        {userName ? (
          <p>Привет, {userName}!</p>
        ) : (
          <p>Пожалуйста, войдите в систему.</p>
        )}
      </div>
    );
  };
  
export const getServerSideProps: GetServerSideProps = async (context) => {
    // Здесь можно получить данные о пользователе из кук или запроса
    const session = context.req.cookies.session; // пример получения сессии из кук
    let userName = null;
  
    if (session) {
      // Запрос к API для получения данных о пользователе
      userName = 'John Doe'; // пример имени пользователя
    }
  
    return {
      props: {
        userName,
      },
    };
  };

  export default Profile;
