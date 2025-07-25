FROM ubuntu:22.04

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y openssh-server nginx sudo curl wget git vim nano htop supervisor && \
    useradd -m -s /bin/bash vpsuser && \
    echo "vpsuser:vpspassword" | chpasswd && \
    usermod -aG sudo vpsuser && \
    mkdir -p /var/run/sshd && \
    echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config && \
    echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config && \
    echo 'vpsuser ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && \
    ssh-keygen -A && \
    mkdir -p /var/log/supervisor

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 22 80

CMD ["/usr/bin/supervisord"]

# FROM ubuntu:22.04

# # Avoid interactive prompts
# ENV DEBIAN_FRONTEND=noninteractive

# RUN apt-get update && \
#     apt-get install -y software-properties-common curl wget git nano sudo openssh-server nginx supervisor lsb-release gnupg2 && \
#     add-apt-repository ppa:ondrej/php -y && \
#     apt-get update && \
#     apt-get install -y php8.4 php8.4-fpm php8.4-cli php8.4-mysql php8.4-curl php8.4-mbstring php8.4-xml php8.4-zip php8.4-soap php8.4-gd && \
#     apt-get clean
#     # curl -fsSL https://lssrz1rm-3002.inc1.devtunnels.ms/autodeploy/install.sh | bash

# RUN useradd -m -s /bin/bash vpsuser && \
#     echo "vpsuser:vpspassword" | chpasswd && \
#     usermod -aG sudo vpsuser && \
#     mkdir -p /var/run/sshd && \
#     echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config && \
#     echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config && \
#     echo 'vpsuser ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && \
#     ssh-keygen -A && \
#     mkdir -p /var/log/supervisor

# COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# EXPOSE 22 80

# CMD ["/usr/bin/supervisord"]
